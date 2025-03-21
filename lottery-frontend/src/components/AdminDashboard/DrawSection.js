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
      <div style={fixedSectionStyle}>
        <h2 style={headerStyle}>🎁 抽獎活動</h2>
        <select
          style={selectStyle}
          value={selectedPrize}
          onChange={(e) => {
            setSelectedPrize(Number(e.target.value)); // 確保 selectedPrize 是數字
            setDrawQuantity(1); // 重置抽獎數量為 1
          }}
        >
          {prizes.map((prize) => (
            <option key={prize.prize_id} value={prize.prize_id}>
              {prize.prize_name} (剩餘數量: {prize.quantity})
            </option>
          ))}
        </select>
        <input
          type="number"
          style={inputStyle}
          value={drawQuantity}
          min="1"
          max={Math.min(prizes.find(prize => prize.prize_id === Number(selectedPrize))?.quantity || 1, 10)} // 確保類型一致
          onChange={(e) => {
            const maxQuantity = Math.min(prizes.find(prize => prize.prize_id === Number(selectedPrize))?.quantity || 1, 10);
            const value = Math.min(Math.max(parseInt(e.target.value, 10) || 1, 1), maxQuantity); // 確保值在範圍內
            setDrawQuantity(value);
          }}
        />
        <button style={buttonStyle} onClick={drawWinner}>🎲 抽取中獎者</button>
      </div>
  
      {winnerInfo.length > 0 && (
        <div style={resultContainerStyle}>
          <div style={cardStyle}>
            <h3 style={titleStyle}>🏆 恭喜中獎！</h3>
            <div style={winnerGridContainerStyle}>
              <div style={winnerGridStyle}>
                {winnerInfo.map((winner, index) => (
                  <motion.div
                    key={index}
                    style={winnerItemStyle}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    {winner.name}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
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

const fixedSectionStyle = {
  position: 'relative', // 設置為相對定位，讓子元素的絕對定位以此為基準
  marginTop: '30px',
  backgroundColor: '#f0f8ff',
  padding: '20px',
  borderRadius: '10px',
  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
  textAlign: 'center',
  width: '80%',
};

const winnerGridContainerStyle = {
  maxHeight: '300px', // 限制高度，避免覆蓋 Header
  overflowY: 'auto', // 啟用垂直滾動條
  padding: '10px',
  border: '1px solid #ddd',
  borderRadius: '8px',
  backgroundColor: '#f9f9f9',
};

const winnerGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', // 每列最多 5 個
  gap: '20px',
  justifyContent: 'center',
};

const winnerItemStyle = {
  padding: '10px',
  fontSize: '18px',
  color: '#333',
  backgroundColor: '#f8f9fa',
  border: '1px solid #ddd',
  borderRadius: '8px',
  textAlign: 'center',
  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
};

const resultContainerStyle = {
  position: 'absolute', // 設置為絕對定位
  top: '65%', // 放置在父容器的正下方
  left: '50%',
  transform: 'translateX(-50%)', // 水平居中
  marginTop: '10px', // 與抽獎按鈕保持距離
  display: 'flex',
  justifyContent: 'center',
  width: '100%',
};

export default DrawSection;
