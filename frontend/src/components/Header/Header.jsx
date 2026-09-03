export default function Header({ title, subtitle, user }) {
  return (
    <header className="flex justify-between items-center bg-white px-8 py-5 border-b">

      <div>
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className="text-gray-500">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        <img
          src={user.avatar}
          alt={user.name}
          className="w-10 h-10 rounded-full"
        />

        <div>
          <h4>{user.name}</h4>
          <p>Admin</p>
        </div>
      </div>

    </header>
  );
}