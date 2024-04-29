const jwt = require("jsonwebtoken");

// 엑세스 토큰 생성
const generateAccessToken = (payload: any): string => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
};

// 리프레시 토큰 생성
const generateRefreshToken = (payload: any): string => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET);
};

// 리프레시 토큰 검증
const verifyRefreshToken = (token: string): any => {
  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    return decoded;
  } catch (error) {
    throw new Error("Invalid refresh token");
  }
};

// 리프레시 토큰 검증
const decodedAccessToken = (token: string): any => {
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    return decoded;
  } catch (error) {
    return false;
  }
};

// 엑세스 토큰과 리프레시 토큰의 사용자 정보가 같은지 확인하는 함수
const verifyAccessToken = (
  accessToken: string,
  refreshToken: string
): boolean => {
  try {
    // 엑세스 토큰의 사용자 정보 가져오기
    const decodedAccessToken: any = jwt.decode(accessToken);
    const accessTokenUserId = decodedAccessToken.userId;

    // 리프레시 토큰의 사용자 정보 가져오기
    const decodedRefreshToken: any = jwt.decode(refreshToken);
    const refreshTokenUserId = decodedRefreshToken.userId;

    // 엑세스 토큰과 리프레시 토큰의 사용자 정보가 같은지 확인
    if (accessTokenUserId === refreshTokenUserId) {
      return true; // 사용자 정보가 일치함
    } else {
      return false; // 사용자 정보가 일치하지 않음
    }
  } catch (error) {
    console.error("Error verifying user match:", error);
    return false;
  }
};

export {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  verifyAccessToken,
  decodedAccessToken,
};
