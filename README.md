# outfit_weather_backend

배포주소: 

대시보드: https://www.notion.so/e8e8c5788f3d4461b38cd3d6a536b92f

# 비즈니스 로직

## **1. 사용자가 입력한 옷 정보 저장하기**:

---

- 클라이언트 :
    - 사용자가 데이터{옷사진파일, 옷이름, 카테고리, 세부카테고리, 기온}입력 및 서버로 전달
    
    ```jsx
    //multipart/form-data
    {
      image: File,
      name: String,
      category: String,
      subcategory: String,
      temp: String
    }
    ```
    
- 서버:
    - 사용자가 전달한 옷사진파일을 s3에 업로드 이미지url 생성
    - 사용자가 전달한 데이터에 weight 객체를 추가 각 키값이 카테고리는 빈배열로 추가
    
    ```jsx
    {
      category: String,
      subcategory: String,
      temp: String,
      imgSrc: String,
      name: String,
      weight:{
       outer:[],
       top:[],
       inner:[],
       bottom:[],
      }
    }
    ```
    
     
    

## **2. 카카오맵으로 지역 선정하기:**

---

**카카오맵 api를 통해 위치를 선정 위도 경도 가져오기**

## **3. 날씨 API로 현재 기온 확인하기**:

---

- 클라이언트:
    - 기상청 단기예보API를 사용 {최저기온, 최고기온, 현재기온, 습도, 강수확률, 하늘상태} 표시
        
        
        | POP | 강수확률 |
        | --- | --- |
        | PTY | 강수형태 |
        | REH | 습도 |
        | SKY | 하늘상태 |
        | TMN | 일 최저기온 |
        | TMX | 일 최고기온 |
    - 최저기온과 최고기온의 평균으로 평균기온을 생성 저장

## **4. 추천코디 선정하기 (가중치 생성):**

---

- **클라이언트;
- 카테고리 : item id 형식의 데이터 객체 전달**

```jsx
{
   outer:**item id**값,
   top:**item id**값,
   inner:**item id**값,
   bottom:**item id**값,
  }
}
```

- 서버:
- 각 **item id에 해당하는 데이터를 찾아 weight 객체 속 해당하는 카테고리 배열에 추가 
첫 추가시 count=0;**

 ****

## **5. 추천코디 생성하기 ( 조합생성 )**:

---

- 서버:
    1. 상의카테고리(outer, top , inner)를 기준으로, 평균기온범위에 해당하는 아이템 찾음
    2. 찾은 데이터의 weight 가중치 객체(하위카테고리가 키, 값이 아이템 배열)에서 아이템의 count(같이 선정된 횟수) 가 높은 순으로 추출 
    3. weight의 아이템보다 추출하는 데이터가 많다면 이후의 데이터는 해당 카테고리 가중치 배열에서 무작위로 추출 
    4. 가중치 객체에서 가져올 데이터가 없다면 해당 카테고리 아이템 전체에서 랜덤으로 가져옴 

## **6. 추천 결과 반환하기**:

---

- 클라이언트 :
    - 추천된 코디나 옷 조합을 확인 및 선택.
