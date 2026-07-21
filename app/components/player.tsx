'use client';

import { useState, useEffect, useRef } from 'react';

type Track = {
  title: string;
  src: string;
};

const tracksData: Track[] = [
  { title: 'Snow is Falling', src: '/snow_is_falling.m4a' },
  { title: 'We Wish You', src: '/we_wish_you.m4a' },
  { title: "Can't Help Falling", src: '/Cant_Help_Falling.m4a' },
  { title: 'Little Drummer Boy', src: '/little_drummer_boy.m4a' },
];

export default function MusicPlayer() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userTracks, setUserTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const audioRef = useRef(new Audio());

  // Play/pause toggle
  const togglePlayPause = () => {
    if (!currentTrack) return;
    if (audioRef.current.paused) audioRef.current.play();
    else audioRef.current.pause();
  };

  // Select track to play
  const selectTrack = (track: Track) => {
    audioRef.current.src = track.src;
    audioRef.current.play();
    setCurrentTrack(track);
  };

  // Auto-close dropdown after 3s
  useEffect(() => {
    if (!dropdownOpen) return;
    const timer = setTimeout(() => setDropdownOpen(false), 3000);
    return () => clearTimeout(timer);
  }, [dropdownOpen]);

  // Close dropdown when clicking outside
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

  // Update play/pause state
  useEffect(() => {
    const audio = audioRef.current;
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTrack(null);
    };
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Handle file upload
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result !== 'string') return;

      const newTrack: Track = {
        title: file.name,
        src: ev.target.result,
      };
      setUserTracks((prev) => [...prev, newTrack]);
    };
    reader.readAsDataURL(file);
  };

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
            {isPlaying ? 'Pause' : 'Resume'}
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
            z-50
          "
        >
          <ul>
            {tracksData.concat(userTracks).map((track, i) => (
              <li
                key={i}
                onClick={() => selectTrack(track)}
                className={`cursor-pointer p-2 rounded ${
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
              className="w-full p-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Add Music
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
