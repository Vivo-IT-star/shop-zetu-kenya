'use client';

import { useState, useEffect, useRef } from 'react';

type Track = {
  title: string;
  src: string; // URL or Object URL for playback
  id?: number; // optional ID for IndexedDB
};

// Preloaded tracks
const tracksData: Track[] = [
  { title: 'Snow is Falling', src: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/snow_is_falling.m4a?v=1766500691' },
  { title: 'We Wish You', src: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/we_wish_you.m4a?v=1766500691' },
  { title: "Can't Help Falling", src: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Cant_Help_Falling.m4a?v=1766500691' },
  { title: 'Little Drummer Boy', src: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/little_drummer_boy.m4a?v=1766500692' },
];

export default function MusicPlayer() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef(new Audio());

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userTracks, setUserTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);

  // -----------------------
  // IndexedDB Setup
  // -----------------------
  const dbName = 'music_player';
  const storeName = 'user_tracks';

  useEffect(() => {
    const openDB = indexedDB.open(dbName, 1);
    openDB.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
    };
    openDB.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => {
        const tracks = getAllRequest.result.map((t: any) => ({
          title: t.title,
          src: URL.createObjectURL(t.blob),
          id: t.id,
        }));
        setUserTracks(tracks);
      };
    };
  }, []);

  // -----------------------
  // Audio Controls
  // -----------------------
  const togglePlayPause = () => {
    if (!currentTrack) return;
    if (audioRef.current.paused) audioRef.current.play();
    else audioRef.current.pause();
  };

  const selectTrack = (track: Track) => {
    audioRef.current.src = track.src;
    audioRef.current.play();
    setCurrentTrack(track);
  };

  useEffect(() => {
    const audio = audioRef.current;
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // -----------------------
  // Upload & Save Track
  // -----------------------
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Save file to IndexedDB
    const reader = new FileReader();
    reader.onload = () => {
      const blob = new Blob([reader.result as ArrayBuffer], { type: file.type });

      const openDB = indexedDB.open(dbName, 1);
      openDB.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);

        const addRequest = store.add({ title: file.name, blob });
        addRequest.onsuccess = (addEvent) => {
          const id = (addEvent.target as IDBRequest).result as number;
          // Add to state with object URL
          setUserTracks((prev) => [...prev, { title: file.name, src: URL.createObjectURL(blob), id }]);
        };
      };
    };
    reader.readAsArrayBuffer(file);
  };

  // -----------------------
  // Dropdown click outside
  // -----------------------
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  return (
    <div className="music-control fixed md:top-3 md:right-9 z-50 w-full md:w-auto flex flex-col items-center md:items-start gap-2 px-3 md:px-0">
      {/* Buttons */}
      <div className="relative flex gap-2">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="px-4 py-2 rounded bg-white text-black font-bold cursor-pointer"
        >
          Christmas Playlist 🎄
        </button>

        {currentTrack && (
          <button
            onClick={togglePlayPause}
            className="px-4 py-2 rounded bg-green-600 text-white font-bold cursor-pointer"
          >
            {isPlaying ? 'Playing' : 'Resume'}
          </button>
        )}
      </div>

      {/* Dropdown */}
      {dropdownOpen && (
        <div
          ref={dropdownRef}
          className="
            absolute
            top-full
            left-1/2
            -translate-x-1/2
            md:left-auto md:translate-x-0
            md:top-full
            mt-2
            bg-white
            text-black
            p-4
            rounded
            shadow-lg
            min-w-[220px]
            max-h-[300px]
            overflow-y-auto
            z-50
          "
        >
          <ul className='text-left'>
            {tracksData.concat(userTracks).map((track, i) => (
              <li
                key={i}
                onClick={() => selectTrack(track)}
                className={`cursor-pointer hover:bg-green-200 p-2 rounded ${
                  currentTrack?.src === track.src ? 'bg-green-100 font-bold' : ''
                }`}
              >
                {track.title}
              </li>
            ))}
          </ul>

          <div className="mt-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full cursor-pointer p-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Bring Your Music
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleUpload}
            />
          </div>
        </div>
      )}
    </div>
  );
}
