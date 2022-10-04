# 타입 연산과 제너릭 사용으로 반복 줄이기

혹시 **DRY**(Don't Repeat Yourself) 라는 조언을 들어보셨나요?

한국말로 말하면 `반복하지 마라!`의 약자인데요, 시스템 내에서 특정한 기능이나 로직은 단 한곳에서 명확하고 신뢰할 수 있게 존재해야 합니다.

비슷한 코드가 반복된다면, 수정이 일어날 경우 반복되는 모든 곳에서 동일하게 수정을 해줘야 하고 실수할 확률이 올라갑니다.

그런데 반복된 코드를 열심히 제거하며 DRY 원칙을 지켰던 개발자라도 타입에 관해서는 잘 지키지 못했을지도 모릅니다.

타입 시스템에 어떻게 **DRY 원칙**을 잘 적용할 수 있을까요?

</br>

## 타입에 이름 붙이기

반복을 줄이는 가장 간단한 방법은 타입에 이름을 붙여주는 것입니다.

```typescript
function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}
```

```typescript
interface Point2D {
  x: number;
  y: number;
}

function distance(a: Point2D, b: Point2D) {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}
```

중복된 타입은 종종 문법에 의해 가려지기도 합니다.

```typescript
function get(url: string, opts: Options): Promise<Response> {
  /* ... */
}
function post(url: string, opts: Options): Promise<Response> {
  /* ... */
}
```

```typescript
type HTTPFunction = (url: string, opts: Object) => Promise<Response>;
const get: HTTPFunction = (url, opts) => {
  /* ... */
};
const post: HTTPFunction = (url, opts) => {
  /* ... */
};
```

> 같은 타입 시그니처를 공유한다면 해당 시그니처를 명명된 타입으로 분리

</br>

## 타입의 확장

```typescript
interface Person {
  firstName: string;
  lastName: string;
}

interface PersonWithBirthDate {
  firstName: string;
  lastName: string;
  birth: Date;
}
```

```typescript
interface Person {
  firstName: string;
  lastName: string;
}

interface PersonWithBirthDate extends Person {
  birth: Date;
}
```

> 한 인터페이스가 다른 인터페이스를 확장하여 반복을 제거

```typescript
type PersonWithBirthDate = Person & { birth: Date };
```

> 이미 존재하는 타입을 확장할 때, 일반적이지는 않지만 인터섹션 연산자를 사용할 수도 있습니다.

</br>

## Pick 의 사용

전체 애플리케이션의 상태를 표현하는 State 타입과 단지 부분만 표현하는 TopNavState가 있는 경우를 살펴보겠습니다.

```typescript
interface State {
  userId: string;
  pageTitle: string;
  recentFiles: string[];
  pageContents: string;
}

interface TopNavState {
  userId: string;
  pageTitle: string;
  recentFiles: string[];
}
```

이럴 경우 State를 인덱싱하는 방법이 있습니다.

```typescript
interface TopNavState {
  userId: State['userId'];
  pageTitle: State['pageTitle'];
  recentFiles: State['recentFiles'];
}
```

그러나 중복 제거가 아직 끝나지 않았습니다. 이 때 `매핑된 타입`을 사용하면 좀 더 나아집니다.

```typescript
type TopNavState = {
  [k in 'userId' | 'pageTitle' | 'recentFiles']: State[k];
};
```

마우스를 올렸을 때 기존의 type과 동일함을 확인할 수 있습니다.

<img width="647" alt="스크린샷 2022-10-05 오전 1 34 57" src="https://user-images.githubusercontent.com/76726411/193876277-83d5e431-d691-43b1-a73e-187f74ab618f.png">

매핑된 타입은 배열의 필드를 루프 도는 것과 같은 방식입니다. 이 패턴은 표준 라이브러리에서도 일반적으로 찾을 수 있으며, PICK 이라고 합니다.

```typescript
// 완벽한 정의는 아님
type Pick<T, K> = {
  [k in K]: T[k];
};
```

```typescript
type TopNavState = Pick<State, 'userId' | 'pageTitle' | 'recentFiles'>;
```

> 여기서 Pick은 제너릭 타입입니다. 마치 함수에서 두 개의 매개변수 값을 받아서 결괏값을 반환하는 것처럼, Pick은 T,K 두 가지 타입을 받아서 결과 타입을 반환합니다.

</br>

## Partial의 사용

생성하고 난 다음에 업데이트가 되는 클래스를 정의한다면, update 메서드 매개변수 타입은 생성자와 동일한 매개변수이면서, 타입 대부분이 선택적 필드가 됩니다.

```typescript
interface Options {
  width: number;
  height: number;
  color: string;
  label: string;
}
interface OptionUpdate {
  width?: number;
  height?: number;
  color?: string;
  label?: string;
}
class UIwidget {
  constructor(init: Options) {...}
  update(options: OptionUpdate){...}
}
```

매핑된 타입과 `keyof`를 사용하면 Options로부터 OptionsUpdate를 만들 수 있습니다.

```typescript
type OptionsUpdate = { [k in keyof Options]?: Options[k] };
```

`keyof`는 타입을 받아서 속성 타입의 유니온을 반환합니다.

```typescript
type OptionsKeys = keyof Options;
// 타입이 "width" | "height" | "color" | "label"
```

이 패턴 역시 일반적이며 표준 라이브러리에 `Partial`이라는 이름으로 포함되어 있습니다.

```typescript
interface Options {
  width: number;
  height: number;
  color: string;
  label: string;
}

class UIwidget {
  constructor(init: Options) {...}
  update(options: Partial<Options>){...}
}
```

</br>

## 제너릭 타입에서 매개변수를 제한하는 방법

제네릭 타입은 타입을 위한 함수와 같습니다. 그리고 함수는 코드에 대한 DRY 원칙을 지킬 때 유용하게 사용됩니다.

여기서 생각해 볼 점이 있습니다.

함수에서 매개변수로 매핑할 수 있는 값을 제한하기 위해 타입 시스템을 사용합니다. 그럼 제네릭 타입에서 매개변수를 제한할 수 있는 방법은 무엇일까요?

> 바로 extends를 사용하는 것입니다.

```typescript
interface Name {
  first: string;
  last: string;
}
type DancingDuo<T extends Name> = [T, T];

const couple1: DancingDuo<Name> = [
  { first: 'Fred', last: 'Astaire' },
  { first: 'Ginger', last: 'Rogers' },
];

const couple2: DancingDuo<{ first: string }> = [
  // ~~~ 'Name' 타입에 필요한 'last' 속성이  {first: string} 타입에 없습니다.
  { first: 'Fred' },
  { first: 'Ginger' },
];
```

앞에서 나온 Pick의 정의도 extends를 사용해서 완성할 수 있습니다.

```typescript
type Pick<T, K> = {
  [k in K]: T[k];
};
```

기존 정의에서 K는 T와 무관하고 범위도 너무 넓습니다. K는 실제로 T의 key의 부분집합, 즉 keyof T 가 되어야 합니다.

```typescript
type Pick<T, K extends keyof T> = {
  [k in K]: T[K];
};
```

## 요약

- DRY 원칙을 타입에도 최대한 적용해야 합니다.
- 타입에 이름을 붙여서 반복을 피해야 합니다. extends를 사용해서 인터페이스 필드의 반복을 피해야 합니다.
- 타입들 간의 매핑을 위해 타입스크립트가 제공한 도구들을 공부하면 좋습니다.
  - keyof, typeof, 인덱싱, 매핑된 타입들이 포함
- 제너릭 타입은 타입을 위한 함수와 같습니다. 제너릭 타입을 제한하려면 extends를 사용하면 됩니다.
- 표준 라이브러리에 적의된 Pick, Partial같은 제너릭 타입에 익숙해져야 합니다.
