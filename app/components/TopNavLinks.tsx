'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink } from 'react-router';
import MusicPlayer from './MusicPlayer';

const items = [
  {
    title: 'RETURN, REFUND & EXCHANGE POLICY',
    link: 'Vivo Fashion Group Return Process',
    href: '/pages/return-policy',
    text: '!text-white text-sm',
  },
  // {
  //   title: 'APPLY TO SELL!',
  //   link: 'Come Sell With Us !',
  //   href: 'https://shopzetu-vendors.vercel.app/',
  //   text: '!text-lime-400 text-sm font-semibold',
  // },
  {
    title: 'GIVE THE GIFT OF CHOICE',
    link: 'Delight with our exclusive gift vouchers',
    href: 'collections/gift-cards',
    text: '!text-white text-sm',
  },
];

export default function TopNavLinks() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed right-0 left-0 top-0 max-w-[1760px]  mx-auto z-50 bg-[#111111] text-white overflow-hidden">
      {/* ===================== */}
      {/* DESKTOP VIEW */}
      {/* ===================== */}
      <div className="hidden md:grid grid-cols-4 items-center py-2 text-center">
        {/* First 3 items */}
        <div className="col-span-4 grid grid-cols-2">
          {items.map((item, i) => {
            const isExternal = item.href.startsWith('http');
            return (
              <div key={i}>
                <div className={`uppercase font-bold ${item.text}`}>
                  {item.title}
                </div>
                {isExternal ? (
                  <NavLink
                    to={item.href}
                    className={`underline ${item.text} mt-1`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item.link}
                  </NavLink>
                ) : (
                  <span
                    onClick={() => (window.location.href = item.href)}
                    className={`${item.text} mt-1 cursor-pointer`}
                  >
                    {item.link}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* 4th column: Music Player */}
        {/* <div className="flex justify-end">
          <MusicPlayer />
        </div> */}
      </div>

      {/* ===================== */}
      {/* MOBILE MUSIC PLAYER */}
      {/* ===================== */}
      {/* <div className="md:hidden py-2 flex justify-center">
        <MusicPlayer />
      </div> */}

      {/* ===================== */}
      {/* MOBILE SLIDER */}
      {/* ===================== */}
      <div className="md:hidden relative h-12 mt-4 mb-3 overflow-hidden text-center">
        <AnimatePresence>
          <motion.div
            key={index}
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute w-full top-0 left-0 text-xs uppercase"
          >
            <div className="font-bold">{items[index].title}</div>
            {items[index].href.startsWith('http') ? (
              <a
                href={items[index].href}
                className={`underline font-semibold block mt-1 ${items[index].text}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {items[index].link}
              </a>
            ) : (
              <span
                onClick={() => (window.location.href = items[index].href)}
                className={`underline font-semibold block mt-1 cursor-pointer ${items[index].text}`}
              >
                {items[index].link}
              </span>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
