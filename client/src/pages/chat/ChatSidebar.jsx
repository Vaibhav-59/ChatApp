import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/auth";
import SidebarSkeleton from "../skeletons/SidebarSkeleton";
import { Users } from "lucide-react";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  console.log(users)
  const rawOnline = useAuthStore((s) => s.onlineUsers);
  const onlineUsers = Array.isArray(rawOnline) ? rawOnline : Array.isArray(rawOnline?.users) ? rawOnline.users : [];
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const usersArr = Array.isArray(users) ? users : (users && typeof users === 'object' ? Object.values(users) : []);
  const filteredUsers = showOnlineOnly
    ? usersArr.filter((user) => onlineUsers.includes(user._id))
    : usersArr;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-full max-w-[85vw] sm:w-28 md:w-72 lg:w-72 border-r border-base-300 bg-white flex flex-col transition-all duration-200">
      <div className="sticky top-0 z-10 bg-white border-b border-base-300 w-full px-4 py-3">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-zinc-700" />
          <span className="font-semibold text-zinc-800 hidden md:inline">Contacts</span>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <input
            type="search"
            placeholder="Search contacts"
            className="hidden md:block w-full text-sm rounded-md border border-zinc-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            onChange={() => { }}
          />
          <label className="ml-auto flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-xs text-zinc-500 hidden lg:inline">Online</span>
          </label>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-2 scrollbar-thin scrollbar-thumb-zinc-300">
        {filteredUsers.map((user) => {
          const userId = String(user._id || user.id);
          const isOnline = onlineUsers.map(String).includes(userId);
          const avatar = user.avatar || user.profilePic || '/avatar.png';
          const displayName = user.name || user.fullName || user.username || 'User';

          return (
            <button
              key={userId}
              onClick={() => setSelectedUser(user)}
              className={`w-full p-2 flex items-center gap-3 md:gap-3 hover:bg-zinc-50 transition-colors rounded-md md:rounded-none ${selectedUser?._id === userId ? "bg-zinc-100" : ""}`}
            >
              <div className="relative flex-shrink-0">
                <img src={avatar} alt={displayName} className="w-10 h-10 object-cover rounded-full" />
                {isOnline && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white" />
                )}
              </div>

              {/* User info - only visible on medium+ screens */}
              <div className="hidden md:flex flex-col text-left min-w-0">
                <div className="font-medium text-sm truncate">{displayName}</div>
                <div className="text-xs text-zinc-400">{isOnline ? 'Online' : 'Offline'}</div>
              </div>
            </button>
          );
        })}

        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No contacts found</div>
        )}
      </div>
    </aside>
  );
};
export default Sidebar;
