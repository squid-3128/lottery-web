import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';

function DrawSection({ room }) {
  const [winnerInfo, setWinnerInfo] = useState([]);
  const [prizes, setPrizes] = useState([]);
  const [selectedPrize, setSelectedPrize] = useState(null); //用id紀錄
  const [drawQuantity, setDrawQuantity] = useState(1);
  const [allowRepeatWin, setAllowRepeatWin] = useState(false);
  const fetchCalledRef = useRef(false);
  const targetRef = useRef(null); // 用於中獎結果的滾動
  const topRef = useRef(null); // 用於【🎁 抽獎活動】的滾動
  const API_BASE = process.env.REACT_APP_API_BASE;

  useEffect(() => {
    const fetchPrizes = async () => {
      if (fetchCalledRef.current) return;
      fetchCalledRef.current = true;
  
      try {
        const response = await axios.get(`${API_BASE}/database/allprizes?room=${room}`);
        const prizes = response.data;
        setPrizes(prizes);
  
        const defaultPrize = prizes.reduce((max, prize) => prize.quantity > max.quantity ? prize : max, prizes[0]);
        setSelectedPrize(defaultPrize.prize_id);
        setDrawQuantity(1);
      } catch (error) {
        Swal.fire('錯誤', '伺服器異常', 'error');
      }
    };
  
    fetchPrizes();
  }, [API_BASE, room]); // 將 room 加入依賴陣列

  const drawWinner = async () => {
    try {
      // 更新獎品數量
      await axios.put(`${API_BASE}/database/update-prize-quantity`, {
        prize_id: selectedPrize,
        quantity: drawQuantity,
      });
    } catch (error) {
      if (
        error.response.data === '缺少獎品'
      ){
        Swal.fire('錯誤', '尚未新增獎品', 'error');
      } else {
        Swal.fire('錯誤', '獎品數量不足', 'error');
      }
      return;
    }
    try {
      const response = await axios.get(
        `${API_BASE}/database/random-winner?quantity=${drawQuantity}&allowRepeatWin=${allowRepeatWin}&room=${room}`
      );
      const winners = response.data;
      setWinnerInfo(winners);
      setTimeout(() => {
        if (targetRef.current) {
          const y = targetRef.current.getBoundingClientRect().top + window.pageYOffset - 100;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100);
  
      // 修正 draw_time 的格式
      const drawTime = new Date().toISOString().slice(0, 19).replace("T", " ");
  
      // 更改資料表
      for (const winner of winners) {
        // 更新中獎紀錄
        await axios.post(`${API_BASE}/database/record-draw`, {
          draw_time: drawTime,
          participants_id: winner.id,
          prize_id: selectedPrize,
          result: "confirmed",
          room_code: room,
        });
        // 更新中獎者的 status 為 "won"
        await axios.put(`${API_BASE}/database/update-participant-status`, {
          id: winner.id,
          status: "won",
        });
      }
  
      // 更新前端的獎品數量
      setPrizes((prevPrizes) =>
        prevPrizes.map((prize) =>
          prize.prize_id === selectedPrize
            ? { ...prize, quantity: prize.quantity - drawQuantity }
            : prize
        )
      );
    } catch (error) {
      if (
        error.response &&
        error.response.status === 400 &&
        error.response.data?.error?.includes("抽獎人數不足")
      ) {
        Swal.fire('錯誤', '抽獎人數不足', 'error');
      } else {
        Swal.fire('錯誤', '伺服器異常', 'error');
      }
    }
  };

  const exportDrawData = () => {
    window.open(`${API_BASE}/database/export-draw?room=${room}`, '_blank');
  };

  const redrawWinner = async () => {
    try {
      for (const winner of winnerInfo) {
        // 更新 draw 表格的 status 為 "rejected"
        await axios.put(`${API_BASE}/database/update-draw-result`, {
          participants_id: winner.id,
          prize_id: selectedPrize,
          result: "rejected",
        });
        // 更新中獎者的 status 為 "valid"
        await axios.put(`${API_BASE}/database/update-participant-status`, {
          id: winner.id,
          status: "valid",
        });
        await axios.put(`${API_BASE}/database/update-prize-quantity`, {
          prize_id: selectedPrize,
          quantity: -1,
        });
      }
      Swal.fire({
        icon: 'success',
        title: '已重抽！',
        timer: 1000,
        showConfirmButton: false,
      });
      setWinnerInfo([]); // 清空中獎者資訊
      // 更新前端的獎品數量
      setPrizes((prevPrizes) =>
        prevPrizes.map((prize) =>
          prize.prize_id === selectedPrize
            ? { ...prize, quantity: prize.quantity + drawQuantity }
            : prize
        )
      );
      // 平滑滾動到【🎁 抽獎活動】區域
      topRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      Swal.fire('錯誤', '伺服器異常', 'error');
    }
  };
  
  return (
    <div style={containerStyle} ref={topRef}>
      {/* 🎁 抽獎活動區域 */}
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

        <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
          <span style={{ marginRight: '8px' }}>抽取數量：</span>
          <input
            type="number"
            style={inputStyle}
            value={drawQuantity}
            min="1"
            max={Math.min(prizes.find(prize => prize.prize_id === Number(selectedPrize))?.quantity || 1, 10)}
            onChange={(e) => {
              const maxQuantity = Math.min(prizes.find(prize => prize.prize_id === Number(selectedPrize))?.quantity || 1, 10);
              const value = Math.min(Math.max(parseInt(e.target.value, 10) || 1, 1), maxQuantity);
              setDrawQuantity(value);
            }}
          />
        </div>
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
        <div style={resultContainerStyle} ref={targetRef}>
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
      <button style={Exportbutton} onClick={exportDrawData}>📤 匯出中獎資訊</button>
    </div>
  );
}

// 樣式
const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  paddingTop: '80px', // 預留空間給 Header
  padding: '20px',
  textAlign: 'center',
  backgroundColor: '#f0f8ff',
  borderRadius: '10px',
  boxSizing: 'border-box',
};

const headerStyle = {
  fontSize: '36px',
  color: '#007bff',
  marginBottom: '20px',
  fontWeight: 'bold',
};

const selectStyle = {
  padding: '10px',
  fontSize: '16px',
  margin: '10px 0',
  borderRadius: '8px',
  border: '1px solid #007bff',
  width: '100%', // 選擇框在手機上全寬
  maxWidth: '300px',
};

const inputStyle = {
  padding: '10px',
  margin: '10px 0',
  fontSize: '16px',
  borderRadius: '8px',
  border: '1px solid #007bff',
  width: '20%', // 輸入框在手機上全寬
  maxWidth: '300px',
};

const buttonStyle = {
  padding: '12px 24px',
  margin: '10px 0',
  fontSize: '18px',
  color: '#fff',
  backgroundColor: '#007bff',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  width: '100%', // 按鈕在手機上全寬
  maxWidth: '300px',
};

const Exportbutton = {
  padding: '12px 24px',
  margin: '30px 0',
  fontSize: '18px',
  color: '#fff',
  backgroundColor: '#007bff',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  width: '100%', // 按鈕在手機上全寬
  maxWidth: '300px',
};

const cardStyle = {
  marginTop: '30px',
  padding: '30px',
  paddingTop: '0px',
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
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  backgroundColor: '#ffffff',
  marginTop: '100px',
  padding: '20px',
  borderRadius: '10px',
  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
  width: '100%',
  maxWidth: '600px',
  boxSizing: 'border-box',
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
  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', // 自適應列數
  gap: '10px',
  justifyContent: 'center',
  width: '100%',
};

const winnerItemStyle = {
  padding: '10px',
  fontSize: '16px',
  color: '#333',
  backgroundColor: '#f8f9fa',
  border: '1px solid #ddd',
  borderRadius: '8px',
  textAlign: 'center',
  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
};

const resultContainerStyle = {
  marginTop: '40px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  maxWidth: '600px',
  boxSizing: 'border-box',
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

// 新增響應式設計
const responsiveStyle = `
  @media (max-width: 768px) {
    ${containerStyle} {
      padding: 10px;
    }
    ${fixedSectionStyle} {
      width: 100%;
      padding: 10px;
    }
    ${buttonStyle}, ${inputStyle}, ${selectStyle} {
      max-width: 100%;
    }
    ${winnerGridStyle} {
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    }
  }
`;

// 在頁面中插入響應式樣式
const styleElement = document.createElement('style');
styleElement.textContent = responsiveStyle;
document.head.appendChild(styleElement);

export default DrawSection;
