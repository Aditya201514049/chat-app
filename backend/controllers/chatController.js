const accessChat = (req, res) => {
    res.status(200).json({ message: 'Access Chat endpoint is working' });
};

const fetchChats = (req, res) => {
    res.status(200).json({ message: 'Fetch Chats endpoint is working' });
};

module.exports = { accessChat, fetchChats };
