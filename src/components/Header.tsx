import type { FC } from 'react';

const Header: FC = () => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <i className="fa-solid fa-leaf text-2xl text-teal-500"></i>
            <h1 className="text-xl font-bold text-slate-800">Skin & Gut Diary</h1>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;