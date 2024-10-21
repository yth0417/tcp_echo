const handler11 = (data) => {
  // 수신한 데이터를 역순으로 변환
  const processedData = data.toString().split('').reverse().join('');
  return Buffer.from(processedData);
};

export default handler11;
