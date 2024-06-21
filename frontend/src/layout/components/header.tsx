const Header: React.FC = () => {
  return (
    <div className="flex gap-2 items-center mb-8">
      <img src="/img/logo.svg" alt="logo" className="w-[32px] h-[32px]" />
      <div className="text-[18px] text-[#ffffffaa]" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 900 }}>115 FileLister</div>
    </div>
  );
};

export default Header;
