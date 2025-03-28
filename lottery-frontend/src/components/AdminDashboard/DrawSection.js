import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

function DrawSection() {
  const [winnerInfo, setWinnerInfo] = useState([]);
  const [prizes, setPrizes] = useState([]);
  const [selectedPrize, setSelectedPrize] = useState(null);
  const [drawQuantity, setDrawQuantity] = useState(1);
  const [allowRepeatWin, setAllowRepeatWin] = useState(false); // 新增狀態

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
      const response = await axios.get(
        `http://localhost:3001/database/random-winner?quantity=${drawQuantity}&allowRepeatWin=${allowRepeatWin}`
      );
      const winners = response.data;
      setWinnerInfo(winners);
  
      // 修正 draw_time 的格式
      const drawTime = new Date().toISOString().slice(0, 19).replace("T", " ");
  
      // 更改資料表
      for (const winner of winners) {
        // 更新中獎紀錄
        await axios.post("http://localhost:3001/database/record-draw", {
          draw_time: drawTime,
          participants_id: winner.id,
          prize_id: selectedPrize,
          result: "confirmed",
        });
        // 更新中獎者的 status 為 "won"
        await axios.put("http://localhost:3001/database/update-participant-status", {
          id: winner.id,
          status: "won",
        });
      }
  
      // 更新獎品數量
      await axios.put("http://localhost:3001/database/update-prize-quantity", {
        prize_id: selectedPrize,
        quantity: drawQuantity,
      });
  
      // 更新前端的獎品數量
      setPrizes((prevPrizes) =>
        prevPrizes.map((prize) =>
          prize.prize_id === selectedPrize
            ? { ...prize, quantity: prize.quantity - drawQuantity }
            : prize
        )
      );
    } catch (error) {
      console.error("Error during draw:", error);
    }
  };

  const exportDrawData = () => {
    window.open('http://localhost:3001/database/export-draw', '_blank');
  };

  const redrawWinner = async () => {
    try {
      for (const winner of winnerInfo) {
        // 更新 draw 表格的 status 為 "rejected"
        await axios.put("http://localhost:3001/database/update-draw-result", {
          participants_id: winner.id,
          prize_id: selectedPrize,
          result: "rejected",
        });
        // 更新中獎者的 status 為 "rejected"
        await axios.put("http://localhost:3001/database/update-participant-status", {
          id: winner.id,
          status: "valid",
        });
      }
      alert("已重抽！");
      setWinnerInfo([]); // 清空中獎者資訊
    } catch (error) {
      console.error("Error redrawing winner:", error);
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
        <div style={{ margin: "20px 0" }}>
          <label style={but_switch}>
            {/* 隱藏原始 checkbox */}
            <input
              type="checkbox"
              checked={allowRepeatWin}
              onChange={(e) => setAllowRepeatWin(e.target.checked)}
              style={{ display: "none" }} // 隱藏原始 checkbox
            />
            {/* 自定義開關樣式 */}
            <span
              style={{
                ...slider,
                backgroundColor: allowRepeatWin ? "#4caf50" : "#ccc", // 根據狀態改變背景色
              }}
            >
              <span
                style={{
                  position: "absolute",
                  height: "16px",
                  width: "16px",
                  left: allowRepeatWin ? "22px" : "2px", // 根據狀態改變滑塊位置
                  bottom: "2px",
                  backgroundColor: "white",
                  borderRadius: "50%",
                  transition: "0.4s",
                }}
              ></span>
            </span>
            <span style={labelText}>{allowRepeatWin ? "允許重複中獎" : "禁止重複中獎"}</span>
          </label>
        </div>
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
            {/* 新增確認與重抽按鈕 */}
            <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-around" }}>
              <button style={buttonStyle} onClick={redrawWinner}>🔄 重抽</button>
            </div>
          </div>
        </div>
      )}
  
      {/* 匯出按鈕 */}
      <button style={buttonStyle} onClick={exportDrawData}>📤 匯出中獎資訊</button>
    </div>
  );
}

// 樣式
const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '70vh',
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
  margin: '0 10px',
  fontSize: '18px',
  marginBottom: '20px',
  borderRadius: '8px',
  border: '1px solid #007bff',
  width: '80px',
};

const buttonStyle = {
  padding: '12px 24px',
  margin: '20px',
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
  marginTop: '5px', // 縮小與 Header 的距離
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
  top: '70%', // 放置在父容器的正下方
  left: '50%',
  transform: 'translateX(-50%)', // 水平居中
  marginTop: '10px', // 與抽獎按鈕保持距離
  display: 'flex',
  justifyContent: 'center',
  width: '100%',
};

const but_switch = {
  display: "inline-flex",
  alignItems: "center",
  cursor: "pointer",
  gap: "10px",
  margin: "10px 0",
};

const slider = {
  position: "relative",
  width: "40px",
  height: "20px",
  backgroundColor: "#ccc",
  borderRadius: "34px",
  transition: "0.4s",
};

const labelText = {
  fontSize: "16px",
  color: "#333",
};

export default DrawSection;
