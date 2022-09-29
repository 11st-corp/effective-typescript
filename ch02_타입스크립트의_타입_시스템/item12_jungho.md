# 아이템12 함수 표현식에 타입 적용하기

자바스크립트에서는 함수 문장(함수선언문)과 함수표현식을 다르게 인식한다.

```tsx
function rollDice1(sides: number): number {
  /* COMPRESS */ return 0; /* END */
} // Statement
const rollDice2 = function (sides: number): number {
  /* COMPRESS */ return 0; /* END */
}; // Expression
const rollDice3 = (sides: number): number => {
  /* COMPRESS */ return 0; /* END */
}; // Also expression
```

타입스크립트에서는 함수 표현식을 사용하는 것이 좋다.

함수의 매개변수부터 반환값까지 전체를 함수 타입으로 선언하여 함수 표현식에 재사용할 수 있다는 장점이 있기 때문이다.

```tsx
type DiceRollFn = (sides: number) => number;
const rollDice: DiceRollFn = sides => {
  /* COMPRESS */ return 0; /* END */
};
```

<br/>

함수 타입 선언의 장점

- 불필요한 코드의 반복을 줄임
- 하나의 함수 타입으로 통합 가능
- 함수 매개변수에 타입 선언하는 것보다 코드가 간결해지고 안전해진다.

```tsx
function add(a: number, b: number) {
  return a + b;
}
function sub(a: number, b: number) {
  return a - b;
}
function mul(a: number, b: number) {
  return a * b;
}
function div(a: number, b: number) {
  return a / b;
}
```

```tsx
type BinaryFn = (a: number, b: number) => number;
const add: BinaryFn = (a, b) => a + b;
const sub: BinaryFn = (a, b) => a - b;
const mul: BinaryFn = (a, b) => a * b;
const div: BinaryFn = (a, b) => a / b;
```

위 예제는 함수 타입 선언을 이용했던 예제보다 타입 구문이 적다.

함수 구현부도 분리 되어 있어 로직이 분명해진다.

모든 함수 표현식의 반환타입까지 `number`로 선언한 셈이다.

<br/>

라이브러리에서는 공통 함수 시그니처를 타입으로 제공하기도 한다

- 이를 활용하면 코드가 간결하고 안전해진다

예를 들어, `lib.dom.d.ts`를 보면 아래와 같이 `fetch` 함수에 대한 시그니처가 선언되어 있다.

```tsx
declare function fetch(input: RequestInfo, init?: RequestInit): Promise<Response>;
```

이를 활용하면

```tsx
// 아래와 같이 매개변수에 타입을 정의하는 것 대신
async function checkedFetch(input: RequestInfo, init?: RequestInit) {
  const response = await fetch(input, init);
  if (!response.ok) {
    throw new Error('Request failed: ' + response.status);
  }
  return response;
}

// 이런식으로 typeof를 활용하여 간결하게 작성할 수 있다
const checkedFetch: typeof fetch = async (input, init) => {
  const response = await fetch(input, init);
  if (!response.ok) {
    throw new Error('Request failed: ' + response.status);
  }
  return response;
};
```

<br/>

요약

- 매개변수나 반환 값에 타입을 명시하기보다는 함수 표현식 전체에 타입구문을 적용하는 것이 좋다
- 만약 같은 타입 시그니처를 반복적으로 작성한 코드가 있다면 함수 타입을 분리해 내거나 이미 존재하는 타입을 찾아보도록 한다. 라이브러리를 직접 만든다면 공통 콜백에 타입을 제공해야한다.
- 다른 함수 시그니처를 참조하려면 `typeof fn`을 사용하면 된다.
