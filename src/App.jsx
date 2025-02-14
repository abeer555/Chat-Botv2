import { useEffect, useRef, useState } from "react";
import ChatbotIcon from "./components/ChatbotIcon";
import ChatForm from "./components/ChatForm";
import ChatMessage from "./components/ChatMessage";
import { companyInfo } from "./companyInfo";
import jsPDF from "jspdf";
const App = () => {
  const chatBodyRef = useRef();
  const [showChatbot, setShowChatbot] = useState(true);
  const [chatHistory, setChatHistory] = useState([
    {
      hideInChat: true,
      role: "model",
      text: companyInfo,
    },
  ]);
  const getFilters = () => {
    return {
      familySize: document.getElementById("familySize").value,
      budget: document.getElementById("budget").value,
      destinationType: document.getElementById("destinationType").value,
      travelStyle: document.getElementById("travelStyle").value,
      duration: document.getElementById("duration").value,
      season: document.getElementById("season").value,
      interests: document.getElementById("interests").value,
    };
  };
  const generateBotResponse = async (history) => {
    const filters = getFilters();
    const filtersText = Object.entries(filters)
      .filter(([key, value]) => value && value !== "Any")
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");

    const userMessage = history.slice(-1)[0].text;
    const promptWithFilters = filtersText
      ? `Filters selected: ${filtersText}. ${userMessage}`
      : userMessage;

    // Helper function to update chat history
    const updateHistory = (text, isError = false) => {
      setChatHistory((prev) => [
        ...prev.filter((msg) => msg.text != "Thinking..."),
        { role: "model", text, isError },
      ]);
    };
    // Format chat history for API request
    history = history.map(({ role, text }) => ({ role, parts: [{ text: role === "user" ? promptWithFilters : text }] }));
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: history }),
    };
    try {
      // Make the API call to get the bot's response
      const response = await fetch(
        import.meta.env.VITE_API_URL,
        requestOptions
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data?.error.message || "Something went wrong!");
      // Clean and update chat history with bot's response
      const apiResponseText = data.candidates[0].content.parts[0].text
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .trim();
      updateHistory(apiResponseText);
    } catch (error) {
      // Update chat history with the error message
      updateHistory(error.message, true);
    }
  };
  useEffect(() => {
    // Auto-scroll whenever chat history updates
    chatBodyRef.current.scrollTo({
      top: chatBodyRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chatHistory]);
  return (
    <div className={`container ${showChatbot ? "show-chatbot" : ""}`}>
      <button
        onClick={() => setShowChatbot((prev) => !prev)}
        id="chatbot-toggler"
      >
        {/* <span className="material-symbols-rounded">mode_comment</span> */}
        <img src="public/bot.png" alt="" style={{ width: "80px" }} />
        <span className="material-symbols-rounded">✖</span>
      </button>
      <div className="chatbot-popup">
        {/* Chatbot Header */}
        <div className="chat-header">
          <div className="header-info">
            <ChatbotIcon />
            <h2 className="logo-text">Chatbot</h2>
          </div>
          <button
            onClick={() => setShowChatbot((prev) => !prev)}
            className="material-symbols-rounded"
          >
            {/* &darr; */}
          </button>
        </div>
        {/* Filters will be added here */}
        <div className="filters">
          <div className="filter-item">
            <label htmlFor="familySize">Family Size:</label>
            <select id="familySize">
              <option value="">Any</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3+">3+</option>
            </select>
          </div>
          <div className="filter-item">
            <label htmlFor="budget">Budget:</label>
            <select id="budget">
              <option value="">Any</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="filter-item">
            <label htmlFor="destinationType">Destination Type:</label>
            <select id="destinationType">
              <option value="">Any</option>
              <option value="business">Business</option>
              <option value="leisure">Leisure</option>
            </select>
          </div>
          <div className="filter-item">
            <label htmlFor="travelStyle">Travel Style:</label>
            <select id="travelStyle">
              <option value="">Any</option>
              <option value="adventure">Adventure</option>
              <option value="relaxing">Relaxing</option>
              <option value="cultural">Cultural</option>
            </select>
          </div>
          <div className="filter-item">
            <label htmlFor="duration">Duration:</label>
            <select id="duration">
              <option value="">Any</option>
              <option value="weekend">Weekend</option>
              <option value="oneWeek">1 Week</option>
              <option value="twoWeeks">2 Weeks</option>
            </select>
          </div>
          <div className="filter-item">
            <label htmlFor="season">Season:</label>
            <select id="season">
              <option value="">Any</option>
              <option value="spring">Spring</option>
              <option value="summer">Summer</option>
              <option value="autumn">Autumn</option>
              <option value="winter">Winter</option>
            </select>
          </div>
          <div className="filter-item">
            <label htmlFor="interests">Interests:</label>
            <select id="interests">
              <option value="">Any</option>
              <option value="beach">Beach</option>
              <option value="mountains">Mountains</option>
              <option value="city">City</option>
              <option value="nature">Nature</option>
            </select>
          </div>
        </div>
        {/* Chatbot Body */}
        <div ref={chatBodyRef} className="chat-body">
          <div className="message bot-message">
            <ChatbotIcon />
            <p className="message-text">
              Hey there <br /> How can I help you today?
            </p>
          </div>
          {/* Render the chat history dynamically */}
          {chatHistory.map((chat, index) => (
            <ChatMessage key={index} chat={chat} />
          ))}
        </div>
        {/* Chatbot Footer */}
        <div className="chat-footer">
          <ChatForm
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
            generateBotResponse={generateBotResponse}
          />
        </div>
      </div>
    </div>
  );
};
export default App;
