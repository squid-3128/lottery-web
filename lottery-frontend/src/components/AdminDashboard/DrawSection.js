import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

function DrawSection() {
  const [winnerInfo, setWinnerInfo] = useState([]);
  const [prizes, setPrizes] = useState([]);
  const [selectedPrize, setSelectedPrize] = useState(null);
  const [drawQuantity, setDrawQuantity] = useState(1);

  useEffect(() => {
    const fetchPrizes = async () => {
      try {
        const response = await axios.get("http://localhost:3001/database/allprizes");
        const prizes = response.data;
        setPrizes(prizes);

        // 設置預設值為 quantity 最大的獎項
        const defaultPrize = prizes.reduce((max, prize) => prize.quantity > max.quantity ? prize : max, prizes[0]);
        setSelectedPrize(defaultPrize.prize_id);
        setDrawQuantity(1); // 預設抽獎數量為 1
      } catch (error) {
        console.error("Error fetching prizes:", error);
      }
    };

    fetchPrizes();
  }, []);

  const drawWinner = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/database/random-winner?quantity=${drawQuantity}`);
      const winners = response.data;
      setWinnerInfo(winners);

      // 修正 draw_time 的格式
      const drawTime = new Date().toISOString().slice(0, 19).replace("T", " ");

      for (const winner of winners) {
        await axios.post("http://localhost:3001/database/record-draw", {
          draw_time: drawTime,
          participants_id: winner.id,
          prize_id: selectedPrize,
        });
      }
    } catch (error) {
      console.error("Error fetching winners:", error);
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>🎁 抽獎活動</h2>
      <select
        style={selectStyle}
        value={selectedPrize}
        onChange={(e) => {
          setSelectedPrize(e.target.value);
          const selected = prizes.find(prize => prize.prize_id === e.target.value);
          setDrawQuantity(1); // 重置抽獎數量為 1
        }}
      >
        {prizes.map((prize) => (
          <option key={prize.prize_id} value={prize.prize_id}>
            {prize.prize_name}
          </option>
        ))}
      </select>
      <input
        type="number"
        style={inputStyle}
        value={drawQuantity}
        min="1"
        max={prizes.find(prize => prize.prize_id === selectedPrize)?.quantity || 1}
        onChange={(e) => setDrawQuantity(e.target.value)}
      />
      <button style={buttonStyle} onClick={drawWinner}>🎲 抽取中獎者</button>

      {winnerInfo.length > 0 && (
      <div>
        <h3 style={titleStyle}>🏆 恭喜中獎！</h3>
        {winnerInfo.map((winner, index) => (
          <motion.p
            key={index}
            style={infoStyle}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {winner.name}
          </motion.p>
        ))}
      </div>
      )}
    </div>
  );
}

// 樣式
const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '80vh',
  textAlign: 'center',
  backgroundColor: '#f0f8ff',
  padding: '20px',
  borderRadius: '10px',
};

const headerStyle = {
  fontSize: '36px',
  color: '#007bff',
  marginBottom: '20px',
  fontWeight: 'bold',
};

const selectStyle = {
  padding: '10px',
  fontSize: '18px',
  marginBottom: '20px',
  borderRadius: '8px',
  border: '1px solid #007bff',
};

const inputStyle = {
  padding: '10px',
  fontSize: '18px',
  marginBottom: '20px',
  borderRadius: '8px',
  border: '1px solid #007bff',
  width: '80px',
};

const buttonStyle = {
  padding: '12px 24px',
  fontSize: '20px',
  color: '#fff',
  backgroundColor: '#007bff',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
};

const cardStyle = {
  marginTop: '30px',
  padding: '30px',
  width: '450px',
  backgroundColor: '#ffffff',
  boxShadow: '0 0 20px rgba(0, 123, 255, 0.4)',
  borderRadius: '15px',
  textAlign: 'left',
  lineHeight: '1.8',
};

const titleStyle = {
  fontSize: '28px',
  color: '#28a745',
  marginBottom: '10px',
  textAlign: 'center',
};

const infoStyle = {
  fontSize: '18px',
  color: '#333',
};

export default DrawSection;
