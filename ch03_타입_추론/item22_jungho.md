# 아이템22 타입 좁히기

타입 좁히기는 타입스크립트가 넓은 타입으로부터 좁은 타입으로 진행하는 과정이다.

> 이를 통해 타입체커와 IDE의 언어 서비스 지원을 좀 더 명확히 받아 안정적인 코드를 작성할 수 있는 이점이 있다.

<br/>

타입 좁히기의 가장 일반적인 예시로 DOM요소를 가져와 `null`인지 체크하는 과정이 있으며,

타입을 좁히는 방법에는 아래와 같은 방법들이 있다.

- 조건문, 분기문
- instanceof
- Array.isArray와 같은 내장 함수
- 명시적 ‘태그' (태그된 유니온, 구별된 유니온)
- 사용자 정의 타입 가드

<br/>

조건문

```tsx
const el = document.getElementById('foo'); // 타입이 HTMLElement | null

// 조건문으로 처리하기
if (el) {
  // 타입이 HTMLElement
}

// 분기문에서 예외처리
if (!el) throw new Error();
// 타입이 HTMLElement
```

**instanceof**

```tsx
function contains(text: string, search: string | RegExp) {
  if (search instanceof RegExp) {
    search; // RegExp 타입
  }

  search; // string 타입
}
```

**속성 체크**

```tsx
interface A {
  a: number;
}
interface B {
  b: number;
}

function pickAB(ab: A | B) {
  if ('a' in ab) {
    ab; // 타입 A
  } else {
    ab; // 타입 B
  }
  ab; // 타입 A | B
}
```

**내장 함수**

```tsx
function contains(text: string, terms: string | string[]) {
  const termList = Array.isArray(terms) ? terms : [terms];
  termList; // 타입이 string[]
}
// ArrayConstructor.isArray(arg: any): arg is any[]
```

**명시적 ‘태그' 붙이기**

```tsx
interface UploadEvent {
  type: 'upload';
  filename: string;
  contents: string;
}
interface DownloadEvent {
  type: 'download';
  filname: string;
}
type AppEvent = UploadEvent | DownloadEvent;
function handleEvent(e: AppEvent) {
  switch (e.type) {
    case 'download':
      e; // DownloadEvent
      break;
    case 'upload':
      e; // UploadEvent
      break;
  }
}
```

이 패턴은 태그된 유니온 또는 구별된 유니온이라고 불린다.

**사용자 정의 타입 가드 사용하기**

```tsx
function isDefined<T>(x: T | undefined): x is T {
  return x !== undefined;
}

const members = ['Janet', 'Micael'].map(who => jackson5.find(n => n === who)).filter(isDefined); // 타입이 string[]
```

반환타입에 `is` 구문을 넣어 타입을 좁힐 수 있음을 알려준다.

> 위와 같이 반환타입 위치에 `x is T`가 `true`인 경우
> 타입 체커에게 매개변수의 타입을 좁힐 수 있다고 알려준다.

<br/>

# 요약

- 분기문 외에도 여러 종류의 제어 흐름을 살펴보며 타입스크립트가 타입을 좁히는 과정을 이해해야 한다.
- 태그된/구별된 유니온과 사용자 정의 타입 가드를 사용하여 타입 좁히기 과정을 원할하게 만들 수 있다.
