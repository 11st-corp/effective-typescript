# 부정확한 타입보다는 미완성 타입을 사용하기

타입 선언을 작성할 때, 일반적으로 타입이 구체적일수록 버그를 더 많이 잡고 타입스크립트가 제공하는 도구를 활용할 수 있습니다.

그러나 타입 선언의 정밀도를 높이는 일에는 주의를 기울여야 합니다. 잘못된 타입은 차라리 타입이 없는것 보다 못할 수 있기 때문입니다.

GeoJSON 형식의 타입 선언을 작성한다고 가정해보겠습니다.

```typescript
interface Point {
  type: 'Point';
  coordinates: number[];
}

interface LineString{
  type: 'LineString';
  coordinates: number[][];
}

interface Polygon{
  type: 'Polygon';
  coordinates: number[][][];
}

type Geometry = Point | LineString | Polygon;
```

Point 인터페이스의 `number[]`가 추상적이라고 생각하여 튜플 타입으로 선언한다고 해봅시다.

```typescript
type GeoPosition = [number,number];
interface Point{
  type: 'Point';
  coordinates: GeoPosition;
}
```

더 구체적인 코드이지만, GeoJSON의 위치 정보에는 세 번째 요소가 있을 수도 있고, 또 다른 정보가 들어갈 수도 있습니다. 
> 결과적으로 타입 선언을 세밀하게 만들고자 했지만 시도가 너무 과했고 오히려 타입이 부정확해졌습니다.

</br>

### JSON으로 정의된 Lisp와 비슷한 언어의 타입 선언을 작성할 경우

```JSON
12
"red"
["+",1,2] // 3
["/",20,2] // 10
["case",[">",20,10],"red","blue"]
["rgb",255,0,127]
```

이런 동작을 모델링해 볼 수 있는 입력값의 전체 종류를 살펴보겠습니다.
1. 모두 허용
2. 문자열, 숫자, 배열 허용
3. 문자열, 숫자, 알려진 함수 이름으로 시작하는 배열 허용
4. 각 함수가 받는 매개변수의 개수가 정확한지 확인
5. 각 함수가 받는 매개변수의 타입이 정확한지 확인

```typescript
type Expression1 = any; // 1. 모두 허용
type Expression2 = number | string | any[]; // 2. 문자열, 숫자, 배열 허용
```

정밀도를 더 끌어올리기 위해서 튜플의 첫 번째 요소에 문자열 리터럴 요소를 추가합니다.

```typescript
type FnName = '+' | '-' | '*' | '/' | '>' | '<' | 'case' | 'rgb';
type CallExpression = [FnName, ...any[]];
type Expression3 = number | string | CallExpression;

const tests: Expression3[] = [
  10,
  "red",
  true, // ~~ true 형식은 'Expression3' 형식에 할당할 수 없습니다.
  ["+",10,5],
  ["case",[">",20,10],"red","blue","green"],
  ["**",2,31], // ~~ "**" 형식은 'FnName' 형식에 할당할 수 없습니다.
  ["rgb",255,128,64]
]
```

더 정밀하게 바꿔보도록 하겠습니다.

```typescript
type Expression4 = number | string | CallExpression;
type CallExpression = MathCall | CaseCall | RGBCall;

interface MathCall{
  0: '+' | '-' | '/' | '*' | '>' | '<';
  1: Expression4;
  2: Expression4;
  length: 3;
}

interface CaseCall {
  0: 'case';
  1: Expression4;
  2: Expression4;
  3: Expression4;
  length: 4 | 6 | 8 | 10 | 12 | 14 | 16 // 등등...
}

interface RGBCall{
  0: 'rgb';
  1: Expression4;
  2: Expression4;
  3: Expression4;
  length: 4;
}

const test4: Expression4[] = [
  10,
  "red",
  true, // ~~ true 형식은 'Expression4' 형식에 할당할 수 없습니다.
  ["+",10,5],
  ["case",[">",20,10],"red","blue","green"],// ~~ type "case"는 type "rgb"에 할당할 수 없습니다.
  ["**",2,31], // ~~ type "**"는 type "rgb"에 할당할 수 없습니다.
  ["rgb",255,128,64],
  ["rgb",255,128,64,73],// 길이가 5라서 안됨~
]
```

이렇게 하면 무효한 표현식에서 전부 오류가 발생합니다. 그러나 오류가 나면 엉뚱한 메세지를 출력하며, **에 대한 오류는 오히려 이전 버전보다 메시지가 부정확해집니다.
타입 정보가 더 정밀해졌지만 결과적으로 이전 버전보다 개선되었다고 보기는 어렵습니다.

타입 선언의 복잡성으로 인해 버그가 발생할 가능성도 높아졌습니다.
(잘못된 오류를 표시하는 것을 볼 수 있습니다)

<img width="632" alt="스크린샷 2022-11-09 오전 12 08 34" src="https://user-images.githubusercontent.com/76726411/200601527-ce5d9a56-e966-4911-b6df-188d209f4b9c.png">

코드를 더 정밀하게 만들려던 시도가 너무 과했고 그로 인해 코드가 오히려 더 부정확해졌습니다. 
타입을 정제할 때, 불쾌한 골짜기 은유를 생각해 보면 도움이 될 수 있습니다.

- 불쾌한 골짜기?

    ![불쾌한골짜기](https://user-images.githubusercontent.com/76726411/200603218-d8fdccd8-bf72-4176-9b02-7d9f4bfa156c.jpeg)

일반적으로 any 같은 매우 추상적인 타입은 정제하는 것이 좋습니다. 그러나 타입이 구체적으로 정제된다고 해서 정확도가 무조건 올라가지는 않습니다.

## 요약
- 타입 안전성에서 불쾌한 골짜기는 피해야 합니다. 타입이 없는 것보다 잘못된 게 더 나쁩니다.
- 정확하게 타입을 모델링할 수 없다면, 부정확하게 모델링하지 말아야 합니다.
