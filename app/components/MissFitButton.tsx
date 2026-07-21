// 1. Define the strict interface for the product data

import { useEffect, useState } from 'react';

interface MissFitProduct {
    id: string | number;
    title?: string;
    name?: string;
    vendor?: string;
    designer?: string;
    brand_id?: number;
    category_id?: number;
    [key: string]: unknown;
}

// Augment the global Window type to include MissFit injected by the external script
declare global {
    interface Window {
        MissFit?: {
            open: (options: Record<string, unknown>) => void;
        };
    }
}


// Note: MissFit global type is declared elsewhere in the project to avoid duplicate
// declaration conflicts. We rely on that existing declaration and avoid redeclaring
// the Window.MissFit type here.


export default function MissFitButton({ product }: { product: MissFitProduct }) {
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);


    useEffect(() => {
        // 1. Check if it's already loaded
        if (window.MissFit) {
            setIsScriptLoaded(true);
            return;
        }


        // 2. Client-side injection to bypass Hydrogen SSR
        const script = document.createElement('script');
        script.src = "https://missfittech.com/v1/widget.js";
        script.async = true;
       
        script.onload = () => setIsScriptLoaded(true);
        script.onerror = () => console.error("MissFit: Script failed to load. Check Content Security Policy (CSP).");


        document.body.appendChild(script);


        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);


    // 3. Prevent rendering until the script is fully ready
    if (!isScriptLoaded) return null;


    return (
        <button
            className="missfit-trigger-btn"
            onClick={() => {
                if (window.MissFit) {
                    const missFitOptions = {
                        // SECURITY: Replace with the unique API key provided by MissFit
                        apiKey: "mf_live_sz_8f92jK39PqL10",
                       
                        brandId: product.brand_id || 1,
                        categoryId: product.category_id || 1,
                        productId: product.id,
                        productName: product.title || product.name,
                        designerName: product.vendor || "Brand",
                       
                        // ANALYTICS: Pass the active user's ID to track ROI and conversions.
                        // Replace the string below with your actual user.id or cart.id state variable.
                        customerId: "SZ-HYDROGEN-USER",

                        onComplete: (data: unknown) => {
                            console.log("Size confirmed inside Hydrogen. Ready for cart state:", data);
                            // Add logic here to auto-select the size variant in the cart
                        }
                    };

                    window.MissFit.open(missFitOptions);
                }
            }}
        >
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="5" height="5" rx="1"/>
                <rect x="12" y="3" width="5" height="5" rx="1"/>
                <rect x="3" y="12" width="5" height="5" rx="1"/>
                <path d="M13 13h1m3 0h-1m0 0v1m0 3v-1"/>
            </svg>
            Find my exact fit
        </button>
    );
}
