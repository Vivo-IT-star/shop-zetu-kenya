#!/usr/bin/env python
# vendor_monthly.py

import shopify
import binascii
import os
import pandas as pd
from datetime import datetime, timezone, timedelta, date
import json
import numpy as np
import pytz
import requests
import dotenv
import csv
import smtplib
from email.message import EmailMessage
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from email.header import Header
import io
import logging
from pretty_html_table import build_table

def main():
    # Set test mode flag (True for testing, False for production)
    TEST_MODE = False
    TEST_EMAIL = "lewis@shopzetu.com"

    # ------------------------- Setup and Date Calculation -------------------------
    dotenv.load_dotenv()
    api_key = os.getenv("api_key")
    api_secret = os.getenv("api_secret")
    access_token = os.getenv("access_token")
    shop_url = os.getenv("shop_url")
    api_version = os.getenv("api_version")
    state = os.getenv("state")
    redirect_uri = os.getenv("redirect_uri")
    shop_handle = os.getenv("shop_handle")

    shopify.Session.setup(api_key=api_key, secret=api_secret)
    newSession = shopify.Session(shop_url, api_version)
    auth_url = newSession.create_permission_url(redirect_uri, state)
    session = shopify.Session(shop_url, api_version, access_token)
    shopify.ShopifyResource.activate_session(session)
    shop = shopify.Shop.current()  # Get the current shop

    today = datetime.now()
    print(f"[DEBUG] Today's date: {today}")

    def calculate_dates(today):
        print(f"[DEBUG] Calculating dates for day {today.day}")
        if today.day in [11, 25]:
            if today.month == 1:
                orders_start_date = datetime(today.year - 1, 12, 16).isoformat() + "+03:00"
            else:
                orders_start_date = datetime(today.year, today.month - 1, 16).isoformat() + "+03:00"
            last_day_of_previous_month = datetime(today.year, today.month, 1) - timedelta(seconds=1)
            orders_end_date = last_day_of_previous_month.isoformat() + "+03:00"
            returns_start_date = orders_start_date
            returns_end_date = datetime(today.year, today.month, 10, 23, 59, 59).isoformat() + "+03:00"
        elif today.day == 26:
            orders_start_date = datetime(today.year, today.month, 1).isoformat() + "+03:00"
            orders_end_date = datetime(today.year, today.month, 15, 23, 59, 59).isoformat() + "+03:00"
            returns_start_date = orders_start_date
            returns_end_date = datetime(today.year, today.month, 25, 23, 59, 59).isoformat() + "+03:00"
        else:
            raise ValueError("This function should only be run on the 11th or 26th of the month.")
        print(f"[DEBUG] orders_start_date: {orders_start_date}")
        print(f"[DEBUG] orders_end_date: {orders_end_date}")
        print(f"[DEBUG] returns_start_date: {returns_start_date}")
        print(f"[DEBUG] returns_end_date: {returns_end_date}")
        return orders_start_date, orders_end_date, returns_start_date, returns_end_date

    orders_start_date, orders_end_date, returns_start_date, returns_end_date = calculate_dates(today)

    # ------------------------- Orders and Refunds Processing -------------------------
    def get_all_orders(limit=100):
        get_next_page = True
        since_id = 0
        while get_next_page:
            print(f"[DEBUG] Fetching orders with since_id={since_id}")
            orders = shopify.Order.find(
                since_id=since_id,
                limit=limit,
                created_at_min=orders_start_date,
                created_at_max=orders_end_date,
                fields=['id','created_at','name','line_items','financial_status','source_name'],
                cancelled_at=None
            )
            if not orders:
                print("[DEBUG] No orders returned, breaking out of orders loop.")
                break
            for order in orders:
                print(f"[DEBUG] Processing order id: {order.id}")
                yield order
                since_id = order.id
            if len(orders) < limit:
                print("[DEBUG] Fewer orders than limit returned, ending orders pagination.")
                get_next_page = False

    def get_all_refunds(limit=100):
        get_next_page = True
        since_id = 0
        while get_next_page:
            print(f"[DEBUG] Fetching refunds with since_id={since_id}")
            refunds = shopify.Order.find(
                since_id=since_id,
                limit=limit,
                updated_at_min=returns_start_date,
                created_at_max=orders_end_date,
                fields=['id','created_at','name','financial_status','source_name','refunds','cancelled_at'],
                cancelled_at=None
            )
            if not refunds:
                print("[DEBUG] No refunds returned, breaking out of refunds loop.")
                break
            for refund in refunds:
                print(f"[DEBUG] Processing refund id: {refund.id}")
                if refund.refunds:
                    print(f"[DEBUG] Refund id {refund.id} has refund data.")
                    yield refund
                else:
                    print(f"[DEBUG] Refund id {refund.id} has no refund data.")
                since_id = refund.id
            if len(refunds) < limit:
                print("[DEBUG] Fewer refunds than limit returned, ending refunds pagination.")
                get_next_page = False

    print("[DEBUG] Converting orders to DataFrame...")
    orders = pd.DataFrame(order.to_dict() for order in get_all_orders())
    print(f"[DEBUG] Orders DataFrame shape: {orders.shape}")
    orders = orders.explode('line_items').reset_index(drop=True)
    orders = pd.concat([orders.drop(['line_items'], axis=1), orders['line_items'].apply(pd.Series)], axis=1)
    orders['sale_kind'] = 'order'
    orders = orders[['id', 'created_at', 'financial_status', 'fulfillment_status', 'name', 'source_name',
                     'price', 'quantity', 'taxable', 'title', 'variant_id', 'variant_title', 'vendor', 'sale_kind', 'gift_card']]
    orders.columns = ['order_id', 'lineitem_id', 'created_at', 'financial_status', 'fulfillment_status',
                      'order_name', 'product_name', 'source_name', 'price', 'quantity', 'taxable', 'title',
                      'variant_id', 'variant_title', 'vendor', 'sale_kind', 'gift_card']
    cols = ['price', 'quantity']
    orders[cols] = orders[cols].apply(pd.to_numeric, errors='coerce').fillna(0)

    print("[DEBUG] Converting refunds to DataFrame...")
    refunds = pd.DataFrame(refund.to_dict() for refund in get_all_refunds())
    print(f"[DEBUG] Refunds DataFrame shape: {refunds.shape}")

    def extract_line_items_and_restock_type(refund_data):
        line_items = []
        restock_types = []
        created_ats = []
        quantity = []
        for refund in refund_data:
            created_at = refund.get('created_at')
            for item in refund.get('refund_line_items', []):
                line_items.append(item.get('line_item'))
                restock_types.append(item.get('restock_type'))
                quantity.append(item.get('quantity'))
                created_ats.append(created_at)
        return pd.Series([line_items, restock_types, quantity, created_ats],
                         index=['line_items', 'restock_type', 'quantity', 'created_at'])

    refunds[['line_items', 'restock_type', 'returned_quantity', 'refunds_created_at']] = refunds['refunds'].apply(extract_line_items_and_restock_type)
    refunds = refunds.explode(['line_items', 'restock_type', 'returned_quantity', 'refunds_created_at'])
    refunds.reset_index(drop=True, inplace=True)
    refunds = pd.concat([refunds.drop(['line_items', 'refunds'], axis=1), refunds['line_items'].apply(pd.Series)], axis=1)
    refunds['created_at'] = pd.to_datetime(refunds['created_at'])
    refunds['refunds_created_at'] = pd.to_datetime(refunds['refunds_created_at'])
    print("[DEBUG] Applying refund filters...")
    condition_1 = refunds['created_at'] < pd.to_datetime(returns_start_date)
    condition_2 = refunds['refunds_created_at'] < ((pd.to_datetime(returns_start_date) + timedelta(days=10)).isoformat())
    refunds = refunds[~(condition_1 & condition_2)]
    print(f"[DEBUG] Refunds DataFrame shape after filtering: {refunds.shape}")
    refunds = refunds[['id', 'refunds_created_at', 'financial_status', 'fulfillment_status', 'name', 'source_name',
                       'price', 'returned_quantity', 'taxable', 'title', 'variant_id', 'variant_title', 'vendor', 'restock_type', 'gift_card']]
    refunds.columns = ['order_id', 'lineitem_id', 'created_at', 'financial_status', 'fulfillment_status',
                       'order_name', 'product_name', 'source_name', 'price', 'quantity', 'taxable', 'title',
                       'variant_id', 'variant_title', 'vendor', 'sale_kind', 'gift_card']
    refunds['quantity'] = -(refunds['quantity'])
    refunds[cols] = refunds[cols].apply(pd.to_numeric, errors='coerce').fillna(0)
    refunds = refunds[(refunds['created_at'] >= returns_start_date) & (refunds['created_at'] <= returns_end_date)]
    refunds = refunds.drop_duplicates()

    print("[DEBUG] Merging orders and refunds...")
    all_data = pd.concat([orders, refunds])
    print(f"[DEBUG] All data shape: {all_data.shape}")

    def calculate_gross_sales(row):
        price = row['price']
        quantity = row['quantity']
        sale_kind = row['sale_kind']
        if sale_kind == 'order':
            return (price / 1.16) * quantity
        else:
            return 0.00

    all_data['gross_sales'] = all_data.apply(calculate_gross_sales, axis=1)
    all_data['net_sales'] = (all_data['price'] / 1.16) * all_data['quantity']
    all_data['tax'] = all_data['net_sales'] * 0.16
    all_data = all_data.drop_duplicates()
    all_data = all_data[all_data['financial_status'] != 'voided']

    # ------------------------- Balance Brought Forward Calculation -------------------------
    print("[DEBUG] Calculating balance brought forward for previous period transactions...")
    all_data['balance_brought_forward'] = 0.0
    condition_bb = (all_data['sale_kind'] != 'order') & (pd.to_datetime(all_data['created_at']) < pd.to_datetime(orders_start_date))
    all_data.loc[condition_bb, 'balance_brought_forward'] = (all_data.loc[condition_bb, 'price'] / 1.16) * all_data.loc[condition_bb, 'quantity']
    print("[DEBUG] Balance brought forward calculation completed.")

    # ------------------------- Vendor Emails and Deductions -------------------------
    # 1) Fetch vendor emails exactly as before
    sheet_id1 = "1PI3adTRntIWqjOS5BvSkduTFDehu1NPqCTSf2Xwm_pg"
    csv_url1  = f'https://docs.google.com/spreadsheets/d/{sheet_id1}/export?format=csv&gid=0'
    print("[DEBUG] Fetching vendor emails from Google Sheet...")
    response = requests.get(csv_url1)
    decoded_content = response.content.decode('utf-8')
    cr = csv.reader(decoded_content.splitlines(), delimiter=',')
    emails = list(cr)
    email_info = pd.DataFrame(emails[1:], columns=emails[0])
    email_cols = ['commission', 'vat']
    email_info[email_cols] = email_info[email_cols].apply(pd.to_numeric, errors='coerce')

    # 2) Fetch deductions directly into pandas and clean
    sheet_id2 = "1PBcfG8KI3DyIkSC2pKiIwIwkyOn6Ruqeh7QtMuOA-Ls"
    csv_url2  = f'https://docs.google.com/spreadsheets/d/{sheet_id2}/export?format=csv&gid=457185651'
    print("[DEBUG] Fetching and parsing deductions from Google Sheet...")

    deductions = pd.read_csv(
        csv_url2,
        parse_dates=['Date'],
        na_values=['', 'NA'],
        keep_default_na=True,
    )

    # Normalize column names
    deductions.columns = (
        deductions.columns
        .str.strip()
        .str.lower()
        .str.replace(' ', '_')
    )

    # Clean up numeric columns
    deductions['price'] = (
        deductions['price']
        .astype(str)
        .str.replace(',', '')        # remove thousands separators
        .replace('', np.nan)         # empty strings → NaN
        .astype(float)
        .fillna(0.0)                 # NaN → 0.0
    )
    deductions['deductions'] = (
        pd.to_numeric(deductions['deductions'], errors='coerce')
        .fillna(0.0)
    )

    print("[DEBUG] Cleaned deductions head:")
    print(deductions.head().to_string(index=False))

    # 3) Lowercase vendor keys to prepare for the merge
    deductions['vendor'] = deductions['vendor'].str.lower()
    email_info['vendor'] = email_info['vendor'].str.lower()
    all_data['vendor']   = all_data['vendor'].str.lower()

    # …now you can immediately filter/group/merge against `deductions` as a DataFrame…

            #__________________





    # response = requests.get(csv_url2)
    # decoded_content = response.content.decode('utf-8')
    # cr = csv.reader(decoded_content.splitlines(), delimiter=',')
    # deductions = list(cr)
    # print("[DEBUG] First 5 rows of deductions:")
    # for i, row in enumerate(deductions[:5]):
    #     print(f"Row {i}: {row}")

    # expected_columns = [
    #     "Date", "Product Title", "Vendor", "Order Number", "Status",
    #     "Date Received", "Duration(Hrs)", "Price", "Deductions"
    # ]
    # deductions_filtered = []
    # for row in deductions:
    #     if isinstance(row, list) and len(row) >= len(expected_columns):
    #         deductions_filtered.append(row[:len(expected_columns)])
    # deductions_info = pd.DataFrame(deductions_filtered[1:], columns=expected_columns)
    # deductions_info.columns = [col.lower() for col in deductions_info.columns]
    # print(f"[DEBUG] Deductions DataFrame columns: {deductions_info.columns}")
    # if 'price' in deductions_info.columns:
    #     deductions_info['price'] = deductions_info['price'].str.replace(',', '').str.strip()
    # else:
    #     print("⚠️ Warning: 'price' column not found!")
    # print("[DEBUG] Deductions DataFrame conversion completed.")
    # deductions_info["deductions"] = pd.to_numeric(deductions_info["deductions"], errors="coerce").fillna(0)
    # deductions_info['price'] = deductions_info['price'].str.replace(',', '').str.strip()
    # deductions_cols = ['price']
    # deductions_info[deductions_cols] = deductions_info[deductions_cols].apply(pd.to_numeric, errors='coerce')
    # deductions_info['vendor'] = deductions_info['vendor'].str.lower()
    # email_info['vendor'] = email_info['vendor'].str.lower()
    # all_data['vendor'] = all_data['vendor'].str.lower()
    # email_info['commission'] = pd.to_numeric(email_info['commission'], errors='coerce')
    #_____________________________________________________________________________________________________________________________-
    # vendor_deductions_summary = deductions_info[
    #     (deductions_info['status'] == 'Cancelled Vendor Fault') &
    #     (deductions_info['date'] >= orders_start_date) &
    #     (deductions_info['date'] <= orders_end_date)
    # ].groupby('vendor').agg({
    #     'price': lambda x: (x * 0.3).sum()
    # }).reset_index()
    # vendor_deductions_summary.columns = ['vendor', 'deductions']

    # vendor_sales_summary = all_data.groupby('vendor').agg({
    #     'gross_sales': 'sum',
    #     'net_sales': 'sum',
    #     'quantity': 'sum',
    #     'balance_brought_forward': 'sum'
    # }).reset_index()

    # deductions_and_sales = pd.merge(left=vendor_deductions_summary, right=vendor_sales_summary, on='vendor', how='outer')
    # final_summary = pd.merge(left=deductions_and_sales, right=email_info, on='vendor', how='left')

    #___________________________________________________________________________________________________________________________

    # --- After reading ‘deductions’ from CSV/Google Sheets ---
    print("[DEBUG] Raw deductions head:")
    print(deductions.head().to_string(index=False))

    # 1) Parse dates and clean price
    deductions['date'] = pd.to_datetime(
        deductions['date'],
        format="%Y-%m-%d",
        errors="coerce"
    )
    print(f"[DEBUG] Converted 'date' to datetime, nulls: {deductions['date'].isna().sum()}")



    print(f"[DEBUG] Converted 'price' to float; sample prices: {deductions['price'].head().tolist()}")

    # 2) Build filter bounds (tz-naive)
    start_date = pd.to_datetime(orders_start_date).tz_localize(None)
    end_date   = pd.to_datetime(orders_end_date).tz_localize(None)
    print(f"[DEBUG] Filtering deductions between {start_date.date()} and {end_date.date()}")

    # 3) Compute 20% deduction
    deductions['calculated_deduction'] = deductions['price'] * 0.2
    print(f"[DEBUG] Computed 'calculated_deduction'; sample: {deductions['calculated_deduction'].head().tolist()}")

    # 4) Filter for Cancelled Vendor Fault in window
    mask = (
        (deductions['status'] == 'Cancelled Vendor Fault') &
        (deductions['date'] >= start_date) &
        (deductions['date'] <= end_date)
    )
    filtered = deductions.loc[mask]
    print(f"[DEBUG] Rows after filter: {len(filtered)} (of {len(deductions)})")
    print("[DEBUG] Sample filtered rows:")
    print(filtered[['vendor','date','price','calculated_deduction']].head().to_string(index=False))

    # 5) Group & sum per vendor
    vendor_deductions_summary = (
        filtered
        .groupby('vendor')['calculated_deduction']
        .sum()
        .reset_index(name='deductions')
    )
    print("[DEBUG] vendor_deductions_summary:")
    print(vendor_deductions_summary.to_string(index=False))

   # --- After you’ve calculated and populated all_data['balance_brought_forward'] ---

    # --- Main merge into final_summary ---

    # 1) Build vendor_sales_summary including B/F
    vendor_sales_summary = all_data.groupby('vendor').agg({
        'gross_sales'             : 'sum',
        'net_sales'               : 'sum',
        'quantity'                : 'sum',
        'balance_brought_forward' : 'sum'     # <— added here
    }).reset_index()

    print("[DEBUG] vendor_sales_summary with B/F sample:")
    print(vendor_sales_summary[['vendor','gross_sales','net_sales','quantity','balance_brought_forward']]
        .head(10).to_string(index=False))

    # 2) Merge in email, commission, vat
    vendor_summary_with_email = vendor_sales_summary.merge(
        email_info[['vendor','email','commission','vat']],
        on='vendor', how='left'
    )
    # Enforce a 20% commission for every vendor
    vendor_summary_with_email['commission'] = 0.20

    print("[DEBUG] After merging email_info, sample:")
    print(vendor_summary_with_email[['vendor','email','commission','vat','balance_brought_forward']]
        .head(10).to_string(index=False))

    # 3) Merge deductions
    final_summary = (
        vendor_summary_with_email
        .merge(vendor_deductions_summary, on='vendor', how='left')
        .fillna({'deductions': 0})
    )
    print("[DEBUG] final_summary with all metrics sample:")
    print(final_summary[['vendor','gross_sales','net_sales','quantity',
                        'balance_brought_forward','deductions']].head(10)
        .to_string(index=False))

    # 7) Fill missing numeric fields with zero
    for col in [
        'deductions',
        'gross_sales',
        'net_sales',
        'quantity',
        'balance_brought_forward'
    ]:
        final_summary[col] = final_summary[col].fillna(0)
        print(final_summary[['vendor','deductions']].head(10))



    #____________________________________________________________________________________________________________________________
    final_summary['deductions'] = final_summary['deductions'].fillna(0)
    final_summary['gross_sales'] = final_summary['gross_sales'].fillna(0)
    final_summary['net_sales'] = final_summary['net_sales'].fillna(0)
    final_summary['quantity'] = final_summary['quantity'].fillna(0)
    final_summary['balance_brought_forward'] = final_summary['balance_brought_forward'].fillna(0)

    # ------------------------- Email Sending -------------------------
    # Send a consolidated email to finance using the production addresses
    def send_email_with_attachments(subject, body, to, cc, from_email, password, final_summary, all_data):
        try:
            print(f"[DEBUG] Sending email with attachments to {to} (CC: {cc})")
            msg = EmailMessage()
            msg['Subject'] = f"{subject} {datetime.fromisoformat(orders_start_date).date()}"
            msg['From'] = from_email
            msg['To'] = to
            msg['Cc'] = cc
            msg.set_content(body)
            final_summary_path = 'Vendor_Summary.csv'
            all_data_path = 'All_Data.csv'
            final_summary.to_csv(final_summary_path, index=False)
            all_data.to_csv(all_data_path, index=False)
            with open(final_summary_path, 'rb') as f:
                file_data = f.read()
                file_name = f.name
            msg.add_attachment(file_data, maintype='application', subtype='octet-stream', filename=file_name)
            with open(all_data_path, 'rb') as f:
                file_data = f.read()
                file_name = f.name
            msg.add_attachment(file_data, maintype='application', subtype='octet-stream', filename=file_name)
            recipients = to.split(',') + cc.split(',')
            with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
                server.login(from_email, password)
                server.send_message(msg, from_addr=from_email, to_addrs=recipients)
            print("[DEBUG] Email sent successfully with both attachments")
        except Exception as e:
            print(f"[DEBUG] An error occurred while sending email with attachments: {e}")

    # Production configuration for the consolidated email
    subject = 'Vendor Summary for period starting:'
    body = 'Hi Finance, please find the vendor summary and all data attached below.'
    to_finance = 'accounts@shopzetu.com'
    #cc_finance = 'maureen.wakonyo@shopzetu.com, morgan.otieno@shopzetu.com, vendoraccount@shopzetu.com, wanja@shopzetu.com, lewis@shopzetu.com'
    from_email = 'analytics@shopzetu.com'
    password = 'bepehphfklodtglj'
    # Production vs. Test configuration for the consolidated email
    subject     = 'Vendor Summary for period starting:'
    body        = 'Hi Finance, please find the vendor summary and all data attached below.'
    from_email  = 'analytics@shopzetu.com'
    password    = 'bepehphfklodtglj'

    if TEST_MODE:
        to_finance  = TEST_EMAIL
        cc_finance  = ''                 # or you can leave this None
    else:
        to_finance  = 'accounts@shopzetu.com'
        cc_finance  = 'maureen.wakonyo@shopzetu.com, ' \
                    'morgan.otieno@shopzetu.com, ' \
                    'vendoraccount@shopzetu.com, ' \
                    'nigel@shopzetu.com, ' \
                    'were@shopzetu.com'

    send_email_with_attachments(
        subject,
        body,
        to_finance,
        cc_finance,
        from_email,
        password,
        final_summary,
        all_data
    )

    send_email_with_attachments(subject, body, to_finance, cc_finance, from_email, password, final_summary, all_data)


    # -------------------------
    # Updated generate_email_content function to avoid NaN in Amount Received
    def generate_email_content(vendor_name, sales_summary):
        # Ensure commission and VAT are set to 0 if missing or NaN
        commission = sales_summary.get('commission', 0.0)
        if pd.isna(commission):
            commission = 0.0
        vat = sales_summary.get('vat', 0.0)
        if pd.isna(vat):
            vat = 0.0

        # Also ensure net_sales, balance_brought_forward, and deductions are numbers (or default them)
        net_sales = sales_summary.get('net_sales', 0.0)
        if pd.isna(net_sales):
            net_sales = 0.0
        balance_bf = sales_summary.get('balance_brought_forward', 0.0)
        if pd.isna(balance_bf):
            balance_bf = 0.0
        deductions = sales_summary.get('deductions', 0.0)
        if pd.isna(deductions):
            deductions = 0.0

        net_payable = (net_sales * (1 - commission) * (1 + vat)) + balance_bf
        amount_received = net_payable - deductions

        table = {
            'Gross Sales': [f"{sales_summary['gross_sales']:.2f}"],
            'Net Sales': [f"{net_sales:.2f}"],
            'Net Quantity': [f"{sales_summary['quantity']:,}"],
            'Balance B/F': [f"{balance_bf:.2f}"],
            'Net Payable': [f"{net_payable:.2f}"],
            'Total Deductions': [f"{deductions:.2f}"],
            'Amount Received': [f"{amount_received:.2f}"],
        }
        summary_table = pd.DataFrame(table)
        table_html = build_table(summary_table, 'blue_light')
        body_html = f"""
        <html>
        <head></head>
        <body>
            <p>Hi {vendor_name},</p>
            <p>Here is your sales summary:</p>
            <p style="font-family: verdana; background: #d9e1f2; width: fit-content; padding: 5px;">
                <span>Gross Sales: <b>{sales_summary['gross_sales']:.2f}</b></span><br>
                <span>Net Sales: <b>{net_sales:.2f}</b></span><br>
                <span>Net Quantity: <b>{sales_summary['quantity']:.0f}</b></span><br>
                <span>Balance B/F: <b>{balance_bf:.2f}</b></span><br>
            </p>
            <br>
            <p>Please find attached the detailed sales by product.</p>
            <p>Kindly review your sales report and share your ETIMS invoice within 2 working days.</p>
            <p>If there are any discrepancies, kindly contact your account manager within one week.</p>
            <br>
            {table_html}
            <br>
            <p>Best regards,<br>Shop Zetu Analytics</p>
        </body>
        </html>
        """
        return body_html

    def send_email(to_email, cc_emails, subject, content, attachment, filename):
        try:
            print(f"[DEBUG] Sending email to {to_email} (CC: {cc_emails})")
            msg = MIMEMultipart()
            msg['From'] = 'analytics@shopzetu.com'
            msg['To'] = to_email
            msg['Cc'] = ', '.join(cc_emails)
            msg['Subject'] = subject
            msg.attach(MIMEText(content, 'html'))
            part = MIMEBase('application', 'octet-stream')
            part.set_payload(attachment)
            encoders.encode_base64(part)
            part.add_header('Content-Disposition', f'attachment; filename={filename}')
            msg.attach(part)
            server = smtplib.SMTP('smtp.gmail.com', 587)
            server.starttls()
            server.login('analytics@shopzetu.com', 'bepehphfklodtglj')
            text = msg.as_string()
            recipients = [to_email] + cc_emails
            server.sendmail('analytics@shopzetu.com', recipients, text)
            server.quit()
            print(f"[DEBUG] Email successfully sent to {to_email}")
        except Exception as e:
            print(f"[DEBUG] Failed to send email to {to_email}: {e}")

    final_summary['email'].fillna('', inplace=True)
    final_summary['vendor'] = final_summary['vendor'].astype(str)
    final_summary['email'] = final_summary['email'].astype(str)
    all_data['vendor'] = all_data['vendor'].astype(str)

    # ------------------------- Main Email Sending Loop -------------------------
    # Loop over each vendor to send individual emails
    for index, row in final_summary.iterrows():
        vendor_name = row['vendor']
        # Use test email when in TEST_MODE
        to_email = TEST_EMAIL if TEST_MODE else row['email']
        cc_emails = ['maureen.wakonyo@shopzetu.com', 'morgan.otieno@shopzetu.com',
                     'wanja@shopzetu.com', 'vendoraccount@shopzetu.com', 'lewis@shopzetu.com']
        if not row['email'] and not TEST_MODE:
            print(f"[DEBUG] No email provided for vendor: {vendor_name}. Skipping.")
            continue
        sales_summary = row
        product_sales = all_data[all_data['vendor'] == vendor_name]
        csv_buffer = io.StringIO()
        product_sales.to_csv(csv_buffer, index=False)
        csv_attachment = csv_buffer.getvalue()
        email_content = generate_email_content(vendor_name, sales_summary)
        subject_str = f"Sales Report Summary between {datetime.fromisoformat(orders_start_date).date()} and {datetime.fromisoformat(orders_end_date).date()}"
        subject_hdr = Header(subject_str, 'utf-8').encode()
        try:
            send_email(to_email, cc_emails, subject_hdr, email_content, csv_attachment, f'{vendor_name}_sales.csv')
        except Exception as e:
            print(f"[DEBUG] Exception occurred while sending email to {vendor_name}: {e}")

    # ------------------------- Backup Email Sending for Vivo Vendors and Lamazi -------------------------
    # Backup for Vivo vendors: vivo, zoya, safari by vivo.
    vivo_vendors = ["vivo", "zoya", "safari by vivo"]
    for vendor in vivo_vendors:
        try:
            vendor_summary = final_summary[final_summary['vendor'] == vendor].iloc[0]
        except IndexError:
            print(f"[DEBUG] No data available for vendor '{vendor}' in backup sending.")
        else:
            vendor_product_sales = all_data[all_data['vendor'] == vendor]
            csv_buffer = io.StringIO()
            vendor_product_sales.to_csv(csv_buffer, index=False)
            csv_attachment = csv_buffer.getvalue()
            email_content = generate_email_content(vendor.title(), vendor_summary)
            subject_str = f"Sales Report Summary between {datetime.fromisoformat(orders_start_date).date()} and {datetime.fromisoformat(orders_end_date).date()}"
            subject_hdr = Header(subject_str, 'utf-8').encode()
            # Use the common email for Vivo group vendors (override in test mode)
            to_email = TEST_EMAIL if TEST_MODE else "accounts@vivofashiongroup.com"
            cc_emails = ['maureen.wakonyo@shopzetu.com', 'morgan.otieno@shopzetu.com',
                         'wanja@shopzetu.com', 'vendoraccount@shopzetu.com', 'lewis@shopzetu.com']
            try:
                send_email(to_email, cc_emails, subject_hdr, email_content, csv_attachment, f"{vendor.title()}_sales.csv")
            except Exception as e:
                print(f"[DEBUG] Exception occurred during backup sending for {vendor.title()}: {e}")

    # Backup for Lamazi vendors.
    lamazi_emails = [
        "mbithek@impexeastafrica.com",
        "accounts@impexeastafrica.com",
        "hanyango@impexeastafrica.com",
        "eodhiambo@impextransafrica.com"
    ]
    to_email = TEST_EMAIL if TEST_MODE else lamazi_emails[0]
    cc_emails = lamazi_emails[1:]
    try:
        lamazi_summary = final_summary[final_summary['vendor'] == 'lamazi'].iloc[0]
    except IndexError:
        print("[DEBUG] No data available for vendor 'lamazi' in backup sending.")
    else:
        lamazi_product_sales = all_data[all_data['vendor'] == 'lamazi']
        csv_buffer = io.StringIO()
        lamazi_product_sales.to_csv(csv_buffer, index=False)
        csv_attachment = csv_buffer.getvalue()
        email_content = generate_email_content('Lamazi', lamazi_summary)
        subject_str = f"Sales Report Summary between {datetime.fromisoformat(orders_start_date).date()} and {datetime.fromisoformat(orders_end_date).date()}"
        subject_hdr = Header(subject_str, 'utf-8').encode()
        try:
            send_email(to_email, cc_emails, subject_hdr, email_content, csv_attachment, 'Lamazi_sales.csv')
        except Exception as e:
            print(f"[DEBUG] Exception occurred during backup sending for Lamazi: {e}")

    print("[DEBUG] Script execution completed.")

if __name__ == "__main__":
    main()