import './App.css';
import React, { useState, useEffect } from 'react';
import { nodeCreate } from './components/dataProcessing';
import GraphComponent from './components/GraphComponent';

function App() {
  const [currentTime, setCurrentTime] = useState(new Date('2023-10-15T05:32:45.000+00:00'));
  const [data, setData] = useState(null);

  useEffect(() => {
    nodeCreate(currentTime)
      .then((result) => {
        setData(result); // 데이터가 반환되면 상태 업데이트
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [currentTime]);

  const handleButtonClick = (day) => {
    const newTime = new Date(currentTime);
    newTime.setDate(newTime.getDate() + day);
    console.log(newTime)
    setCurrentTime(newTime);
  };

  return (
    <div id="chart">
      {data &&<GraphComponent data={data} />}
      <button onClick={() => handleButtonClick(-1)}>-1 day</button>
      <button onClick={() => handleButtonClick(1)}>+1 day</button>
    </div>
  );
}

export default App;
