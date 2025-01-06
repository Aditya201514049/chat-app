import { useState, useEffect } from 'react';

const ChatRoom = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the users after login
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          return; // If no token, user is not logged in, do nothing
        }

        const response = await fetch('http://localhost:5000/api/users/profiles', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        } else {
          alert('Failed to load users');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="p-4 bg-gray-200 rounded-lg shadow-md max-h-screen overflow-auto">
      {loading ? (
        <p className="text-center text-gray-600">Loading...</p>
      ) : (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-center text-gray-700 mb-4">Friends</h3>
          {users.length > 0 ? (
            users.map((user) => (
              <div
                key={user._id}
                className="p-3 bg-gray-100 border-b border-gray-300 rounded-md hover:bg-gray-200 transition ease-in-out duration-150"
              >
                <p className="text-gray-700">{user.name}</p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-600">No users available</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatRoom;
