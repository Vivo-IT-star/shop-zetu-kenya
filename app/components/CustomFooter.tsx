import React from "react";
import { Link } from "react-router";

const Footer: React.FC = () => {
    return (
        <footer className="bg-[#1f1f1f] text-white px-6 md:px-12 md:mt-8 py-20 mb-0 absolute w-full z-30">
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">

                {/* ABOUT */}
                <div>
                    <h3 className="text-sm font-semibold tracking-widest mb-4">
                        ABOUT US
                    </h3>
                    <ul className="space-y-3 text-sm text-white">
                        <li className="hover:text-white cursor-pointer">
                            <Link to="/pages/about-us" className="!text-white">
                                Get to know us
                            </Link>
                        </li>
                        <li className=" cursor-pointer">
                            <Link to="/pages/marketing-associate-2026" className="!text-lime-500">
                                Careers
                            </Link>
                        </li>
                        <li className="hover:text-white cursor-pointer">
                            <Link to="https://zetustudios.pixieset.com/booking/studio-sessions" target="_blank" className="!text-white">
                                Zetu Studios
                            </Link>
                        </li>
                        <li className="hover:text-white cursor-pointer">
                            <Link to="/pages/blogs/news" className="!text-white">
                                Blogs
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* ABOUT */}
                <div>
                    <h3 className="text-sm font-semibold tracking-widest mb-4">
                        CONTACT US
                    </h3>
                    <ul className="space-y-3 text-sm text-gray-300">
                        <li className="hover:text-white cursor-pointer">Email</li>
                        <li className="text-lime-500  cursor-pointer">
                            support@shopzetu.com
                        </li>
                        <li className="hover:text-white cursor-pointer">Phone</li>
                        <li className="text-lime-500  cursor-pointer">
                            0703 420 780
                        </li>
                    </ul>
                </div>

                {/* HELP & INFORMATION */}
                <div>
                    <h3 className="text-sm font-semibold tracking-widest mb-4">
                        HELP & INFORMATION
                    </h3>
                    <ul className="space-y-3 text-sm text-gray-300">
                        <li className="hover:text-white cursor-pointer">
                             <Link to="/pages/privacy-policy" className="!text-white">
                                Privacy Policy
                            </Link>
                        </li>
                        <li className="hover:text-white cursor-pointer">
                            <Link to="/pages/terms-conditions" className="!text-white">
                                Terms & Conditions
                            </Link>
                        </li>
                        <li className="hover:text-white cursor-pointer">
                            <Link to="/pages/delivery-returns" className="!text-white">
                                Delivery & Returns
                            </Link>
                        </li>
                        <li className="hover:text-white cursor-pointer">
                            <Link to="/pages/return-policy" className="!text-white">
                                Refund and Exchange Policy
                            </Link>
                        </li>

                    </ul>
                </div>



                {/* NEWSLETTER SIGN UP */}
                {/* <div>
                    <h3 className="text-sm font-semibold tracking-widest mb-4">
                        SIGN UP FOR OUR NEWSLETTERS
                    </h3>
                   <p className="text-sm text-gray-300 mb-4">
            Subscribe to get updates on new arrivals and special offers.
          </p>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            // Hook this to your API
                            alert("Subscribed!");
                        }}
                        className="flex flex-col sm:flex-row gap-1 mt-2"
                    >
                        <input
                            type="email"
                            required
                            placeholder="Enter your email"
                            className="w-full px-3 py-2 text-sm rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
                        />

                        <button
                            type="submit"
                            className="px-1 text-sm bg-white text-black rounded-md hover:bg-gray-200 transition"
                        >
                            Subscribe
                        </button>
                    </form>
                </div> */}
            </div>
        </footer>
    );
};

export default Footer;