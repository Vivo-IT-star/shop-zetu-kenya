import type {CartApiQueryFragment} from 'storefrontapi.generated';
import type {CartLayout} from '~/components/CartMain';
import {CartForm, Money, type OptimisticCart} from '@shopify/hydrogen';
import {useRef, useState, useEffect} from 'react';
import {FetcherWithComponents} from 'react-router';


type CartSummaryProps = {
  cart: OptimisticCart<CartApiQueryFragment | null>;
  layout: CartLayout;
};

export function CartSummary({cart, layout}: CartSummaryProps) {
  const className =
    layout === 'page' ? 'cart-summary-page' : 'cart-summary-aside';

  return (
    <div aria-labelledby="cart-summary" className={className}>

      <CartNoteForm note={cart.note ?? undefined} />

      {/* <h4>Totals</h4> */}
      <dl className="cart-subtotal">
        <dt className='mr-2 text-black'>Subtotal </dt>
         {/* <dt className='mr-2 text-white'>No Returns, Exchanges Only</dt> */}
        <dd className='font-bold text-black'>
          {cart.cost?.subtotalAmount?.amount ? (
            <Money data={cart.cost?.subtotalAmount} />
          ) : (
            '-'
          )}
        </dd>
        {/* <dd className='ml-4 text-lime-400'>No Refunds, Exchanges Only</dd> */}
      </dl>

       
     
      {/* <CartDiscounts discountCodes={cart.discountCodes} />
      <CartGiftCard giftCardCodes={cart.appliedGiftCards} /> */}
      <CartCheckoutActions checkoutUrl={cart.checkoutUrl} />
    </div>
  );
}


// function CartNoteForm({note}: {note?: string}) {
//   return (
//     <CartForm
//       route="/cart"
//       action={CartForm.ACTIONS.NoteUpdate}
//       inputs={{note: note ?? ''}}
//     >
//       {() => (
//         <div className="flex items-center justify-center w-full mr-24 space-x-3">
//           <textarea
//             id="note"
//             name="note"
//             defaultValue={note || ''}
//             placeholder="Optional notes for your order"
//             className=" w-full p-3 border border-gray-500 rounded-md text-sm "
//             rows={2}
//           />

//           <button
//             type="submit"
//             className="bg-black  text-white px-4 py-2 rounded-md hover:bg-gray-800 transition"
//           >
//             Save
//           </button>
//         </div>
//       )}
//     </CartForm>
//   );
// }

function CartNoteForm({ note }: { note?: string }) {
  const [noteText, setNoteText] = useState(note || "");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!noteText.trim()) return;

    setLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    await fetch("/cart", {
      method: "POST",
      body: formData,
    });

    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center justify-center w-full md:mr-24 space-x-3"
    >
      <textarea
        id="note"
        name="note"
        value={noteText}
        onChange={(e) => setNoteText(e.target.value)}
        placeholder="Optional notes for your order"
        className="w-full p-3 border text-black border-gray-500 rounded-md text-sm"
        rows={2}
      />

      <button
        type="submit"
        disabled={!noteText.trim() || loading}
        className={`px-4 py-2 cursor-pointer rounded-md text-white transition ${
          saved
            ? "bg-green-600"
            : loading
            ? "bg-gray-400 cursor-not-allowed"
            : noteText.trim()
            ? "bg-black border border-white hover:bg-gray-800"
            : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        {saved ? "Saved" : "Save"}
      </button>
    </form>
  );
}


function CartCheckoutActions({checkoutUrl}: {checkoutUrl?: string}) {
  if (!checkoutUrl) return null;

  return (
    <div className='mb-4'>
      <a href={checkoutUrl} target="_self">
        <button className='bg-black border border-white text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed'>Continue to Checkout &rarr;</button>
      </a>
      <br />
    </div>
  );
}

function CartDiscounts({
  discountCodes,
}: {
  discountCodes?: CartApiQueryFragment['discountCodes'];
}) {
  const codes: string[] =
    discountCodes
      ?.filter((discount) => discount.applicable)
      ?.map(({code}) => code) || [];

  return (
    <div>
      {/* Have existing discount, display it with a remove option */}
      <dl hidden={!codes.length}>
        <div>
          <dt>Discount(s)</dt>
          <UpdateDiscountForm>
            <div className="cart-discount">
              <code>{codes?.join(', ')}</code>
              &nbsp;
              <button>Remove</button>
            </div>
          </UpdateDiscountForm>
        </div>
      </dl>

      {/* Show an input to apply a discount */}
      <UpdateDiscountForm discountCodes={codes}>
        <div>
          <input type="text" name="discountCode" placeholder="Discount code" />
          &nbsp;
          <button type="submit">Apply</button>
        </div>
      </UpdateDiscountForm>
    </div>
  );
}

function UpdateDiscountForm({
  discountCodes,
  children,
}: {
  discountCodes?: string[];
  children: React.ReactNode;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{
        discountCodes: discountCodes || [],
      }}
    >
      {children}
    </CartForm>
  );
}

function CartGiftCard({
  giftCardCodes,
}: {
  giftCardCodes: CartApiQueryFragment['appliedGiftCards'] | undefined;
}) {
  const appliedGiftCardCodes = useRef<string[]>([]);
  const giftCardCodeInput = useRef<HTMLInputElement>(null);
  const codes: string[] =
    giftCardCodes?.map(({lastCharacters}) => `***${lastCharacters}`) || [];

  function saveAppliedCode(code: string) {
    const formattedCode = code.replace(/\s/g, ''); // Remove spaces
    if (!appliedGiftCardCodes.current.includes(formattedCode)) {
      appliedGiftCardCodes.current.push(formattedCode);
    }
    giftCardCodeInput.current!.value = '';
  }

  function removeAppliedCode() {
    appliedGiftCardCodes.current = [];
  }

  return (
    <div>
      {/* Have existing gift card applied, display it with a remove option */}
      <dl hidden={!codes.length}>
        <div>
          <dt>Applied Gift Card(s)</dt>
          <UpdateGiftCardForm>
            <div className="cart-discount">
              <code>{codes?.join(', ')}</code>
              &nbsp;
              <button onSubmit={() => removeAppliedCode}>Remove</button>
            </div>
          </UpdateGiftCardForm>
        </div>
      </dl>

      {/* Show an input to apply a discount */}
      <UpdateGiftCardForm
        giftCardCodes={appliedGiftCardCodes.current}
        saveAppliedCode={saveAppliedCode}
      >
        <div>
          <input
            type="text"
            name="giftCardCode"
            placeholder="Gift card code"
            ref={giftCardCodeInput}
          />
          &nbsp;
          <button type="submit">Apply</button>
        </div>
      </UpdateGiftCardForm>
    </div>
  );
}

function UpdateGiftCardForm({
  giftCardCodes,
  saveAppliedCode,
  children,
}: {
  giftCardCodes?: string[];
  saveAppliedCode?: (code: string) => void;
  removeAppliedCode?: () => void;
  children: React.ReactNode;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesUpdate}
      inputs={{
        giftCardCodes: giftCardCodes || [],
      }}
    >
      {(fetcher: FetcherWithComponents<any>) => {
        const code = fetcher.formData?.get('giftCardCode');
        if (code && saveAppliedCode) {
          saveAppliedCode(code as string);
        }
        return children;
      }}
    </CartForm>
  );
}
