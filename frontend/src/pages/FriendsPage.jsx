
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FriendsPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/users/profiles', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        } else {
          alert('Error fetching users');
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleCreateChat = async (recipientId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/chats/create', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipientId }),
      });

      const chat = await response.json();

      if (response.ok) {
        // Redirect to HomePage with selected chat
        navigate('/second-home', { state: { selectedChat: chat } });
      } else {
        alert('Error creating chat');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-semibold text-center mb-8">Friends</h2>
      {loading ? (
        <p className="text-center text-lg">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {users.map((user) => (
            <div
              key={user._id}
              className="card bg-base-100 shadow-lg rounded-lg overflow-hidden transition-transform duration-300 ease-in-out transform hover:scale-105"
            >
              <figure className="flex justify-center items-center p-4">
                <img
                  src={user.avatar || 'https://via.placeholder.com/150'}
                  alt={user.name}
                  className="rounded-full w-24 h-24 object-cover"
                />
              </figure>
              <div className="card-body text-center">
                <h3 className="text-xl font-semibold">{user.name}</h3>
                <p className="text-sm text-gray-500 mb-4">Active Now</p>
                <button
                  onClick={() => handleCreateChat(user._id)}
                  className="btn btn-primary w-full"
                >
                  Start Chat
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendsPage;
