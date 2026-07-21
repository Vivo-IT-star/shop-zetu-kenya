import { type ActionFunctionArgs, type LoaderFunctionArgs } from '@shopify/remix-oxygen';

interface SubscriptionFormData {
  email: string;
  firstName: string;
  lastName?: string;
  phoneNumber?: string;
  countryCode?: string;
  birthday?: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
  return new Response(
    JSON.stringify({
      error: 'GET method not allowed. Use POST to submit subscription data.',
      method: request.method,
      url: request.url,
    }),
    { status: 405, headers: { 'Content-Type': 'application/json' } }
  );
}

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const klaviyoPrivateKey = context.env.KLAVIYO_PRIVATE_API_KEY;
    if (!klaviyoPrivateKey) {
      return new Response(JSON.stringify({ error: 'Klaviyo API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const formData = (await request.json()) as SubscriptionFormData;
    if (!formData.email || !formData.firstName) {
      return new Response(JSON.stringify({ error: 'Email and first name are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Format birthday for Klaviyo
    let birthdayFormatted = '';
    if (formData.birthday) {
      const date = new Date(formData.birthday);
      birthdayFormatted = `${String(date.getDate()).padStart(2, '0')}/${String(
        date.getMonth() + 1
      ).padStart(2, '0')}/${date.getFullYear()}`;
    }

    // Prepare Klaviyo profile payload
    const payload: Record<string, any> = {
      data: {
        type: 'profile',
        attributes: {
          email: formData.email,
          first_name: formData.firstName,
        },
      },
    };

    if (formData.lastName) payload.data.attributes.last_name = formData.lastName;
    if (formData.phoneNumber && formData.countryCode) {
      payload.data.attributes.phone_number = `${formData.countryCode}${formData.phoneNumber}`;
    }
    if (birthdayFormatted) {
      payload.data.attributes.properties = { birthday: birthdayFormatted };
    }

    // Send profile to Klaviyo
    const profileResponse = await fetch('https://a.klaviyo.com/api/profiles', {
      method: 'POST',
      headers: {
        accept: 'application/vnd.api+json',
        revision: '2025-04-15',
        'content-type': 'application/vnd.api+json',
        Authorization: `Klaviyo-API-Key ${klaviyoPrivateKey}`,
      },
      body: JSON.stringify(payload),
    });

   // ...existing code...

    const profileResponseText = await profileResponse.text();
    //console.log('Klaviyo profile creation response:', profileResponse.status, profileResponseText);
    console.log("Klaviyo Profile Creation Response Status", profileResponse.status)

   // ...existing code...

    if (!profileResponse.ok) {
      let errorMessage = 'Failed to create profile';
      
      try {
        const errorData = JSON.parse(profileResponseText) as {
          errors?: Array<{ 
            detail?: string; 
            title?: string; 
            code?: string;
          }>;
          error?: string;
          message?: string;
        };
        
        // Log the entire error object for debugging
        console.log('Full Klaviyo error object:', JSON.stringify(errorData, null, 2));
        
        if (errorData.errors && errorData.errors.length > 0) {
          const firstError = errorData.errors[0];
          
          // Check for duplicate profile error
          if (firstError.code === 'duplicate_profile') {
            errorMessage = 'This email has already been used';
          } else {
            // Extract the first error message from Klaviyo's error response
            errorMessage = firstError.detail || firstError.title || errorMessage;
          }
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (parseError) {
        // If we can't parse the response, log the raw text
        console.log('Could not parse Klaviyo error response. Raw text:', profileResponseText);
        if (profileResponseText && profileResponseText.trim()) {
          errorMessage = profileResponseText;
        }
      }

      return new Response(JSON.stringify({ 
        error: errorMessage,
        klaviyoError: true,
        statusCode: profileResponse.status 
      }), {
        status: profileResponse.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = JSON.parse(profileResponseText) as { data?: { id?: string } };
    const profileId = result.data?.id;

    // Add profile to list
    if (profileId) {
      const listId = 'RTcv8M';
      const listResponse = await fetch(
        `https://a.klaviyo.com/api/lists/${listId}/relationships/profiles`,
        {
          method: 'POST',
          headers: {
            accept: 'application/vnd.api+json',
            revision: '2025-04-15',
            'content-type': 'application/vnd.api+json',
            Authorization: `Klaviyo-API-Key ${klaviyoPrivateKey}`,
          },
          body: JSON.stringify({ data: [{ type: 'profile', id: profileId }] }),
        }
      );

      console.log(
        'Klaviyo add-to-list response:',
        listResponse.status,
        await listResponse.text()
      );
    }

    // Send welcome email via your Node.js API
    const emailPayload = {
      to: formData.email,
      subject: `🎉 Welcome ${formData.firstName}! Your 5% Discount Code is Inside`,
      html: `
        <h1>Welcome to Zetu Kenya! 🎉</h1>
        <p>Hi ${formData.firstName},</p>
        <p>We're giving you an exclusive <b>5% discount</b> on your first order:</p>
        <h2 style="color:green;">WELCOME5</h2>
        <p>Happy shopping!</p>
      `,
    };

    // console.log('Email payload being sent to sz-admin API:');
    // console.log('URL: https://sz-admin-api.vercel.app/send-klaviyo-email');
    // console.log('Method: POST');
    // console.log('Headers: Content-Type: application/json');
    // console.log('Body:', JSON.stringify(emailPayload, null, 2));


   const emailResponse = await fetch(
      'https://sz-admin-api.vercel.app/send-klaviyo-email',
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(emailPayload),
      }
    );

   const emailResponseText = await emailResponse.text();
    console.log('Email API response status:', emailResponse.status);
    console.log('Email API response body:', emailResponseText);

    if (!emailResponse.ok) {
      console.error('Email sending failed');
    } else {
      console.log('Email sent successfully');
    }

     return new Response(JSON.stringify({ success: true, data: result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Subscription error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
