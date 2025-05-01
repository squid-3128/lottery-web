import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 2000,  // 虛擬使用者數量，代表2000人
  duration: '30s',  // 測試持續30秒
};

export default function () {
  const res = http.get('https://你的網站網址.com');
  
  // 確認回應狀態是200
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
  
  sleep(1);  // 每個使用者等待1秒，模擬真實行為
}
