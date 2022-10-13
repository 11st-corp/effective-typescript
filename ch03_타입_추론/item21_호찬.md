# 아이템 21. 타입 넓히기

- 런타임에 모든 변수는 **유일한 값을** 가진다.
- 컴파일타임에 타입스크립트에서 변수는 **가능한 값들의 집합인 타입을** 가진다.

상수를 사용해서 변수를 초기화할 때 타입을 명시하지 않으면 타입 체커는 타입을 결정해야한다. 

```typescript
const age = 42;
```

즉, 지정된 단일한 값을 가지고 할당 가능한 값들의 집합을 유추해야한다. 타입스크립트에서 이러한 과정을 **넓히기(widening)** 이라 한다.

```typescript
interface Vector3 { x: number; y: number; z: number; }
function getComponent(vector: Vector3, axis: 'x' | 'y' | 'z') {
    return vector[axis];
}

let x = 'x'; // here
let vec = {x: 10, y: 20, z: 30};
getComponent(vec, x);
// Argument of type 'string' is not assignable to parameter of type '"x" | "y" | "z"'.ts(2345)
```

실행이 되지만 컴파일 오류가 발생한다. x의 타입은 할당 시점에서 `넓히기`가 동작해서 `string`으로 추론되었기 때문이다.

```typescript
const mixed = ['x', 1]
```

`mixed`의 타입이 될 수 있는 후보는 상당히 많은걸 알 수 있다.

```typescript
('x' | 1)[]
['x', 1]
[string, number]
readonly [string, number]
(string|number)[] // 이걸로 추론
readonly (string|number)[]
[any, any]
any[]
```

**타입스크립트는 명확성과 유연성 사이에서 균형을 유지하며 추론하려고 한다.**

```typescript
let x = 'x';
x = /x|y\z/;
x = ['x', 'y', 'z'];
```

일반적인 규칙은 변수가 선언된 후로는 타입이 바뀌지 않아야 하므로, `string|RegExp` 나 `string|string[]`이나 any보다는 `string`으로 `x`를 할당 시점에서 추론을 한다.

### 넓히기 과정 제어하기

#### `const`

`let` 대신 `const`로 변수를 선언하면 더 좁은 타입으로 선언할 수 있다.

```diff
interface Vector3 { x: number; y: number; z: number; }
function getComponent(vector: Vector3, axis: 'x' | 'y' | 'z') {
    return vector[axis];
}

- let x = 'x';  // 타입: string
+ const x = 'x'; // 타입: 'x'
let vec = {x: 10, y: 20, z: 30};
getComponent(vec, x);
```

하지만, **객체와 배열의 경우 여전히 문제가 발생한다.**

#### 타입스크립트의 기본 동작 재정의 하기

**타입스크립트의 기본 동작을 재정의를 통해 타입 추론의 강도를 직접 제어할 수 있다.** 방법은 아래 3가지가 있다.

1. 명시적 타입 구문 제공

```typescript
const v: {x: 1|3|5 } = {
    x: 1
}; // 타입: { x: 1|3|5; }
```

2. 타입 체커에 추가적인 문맥 제공

아래 코드는 컴파일 시간에 오류가 발생하지 않는다.

```typescript
function setLanguage(language){ /* ... */ }

setLanguage('Javascript');

let language = 'Javascript';
setLanguage(language);
```

setLanguage 매개변수에 타입을 지정해주면 타입을 좁힐 수 있따.

```typescript
type Language = 'Javascript' | 'Typescript' | 'Python';
function setLanguage(language: Language){ /* ... */ }

setLanguage('Javascript');

let language = 'Javascript';
setLanguage(language);
// Argument of type 'string' is not assignable to parameter of type 'Language'.ts(2345)
```

3. `const` 단언문 사용

```typescript
const v1 = {
    x: 1,
    y: 2,
}; // 타입: { x: number; y: number; }

const v2 = {
    x: 1 as const,
    y: 2,
}; // 타입: { x: 1; y: number; }

const v3 = {
    x: 1,
    y: 2,
} as const; // 타입: { readonly x: 1; readonly y: 2; }
```

배열도 사용 가능하다.

```typescript
const a1 = [1, 2, 3];           // 타입: nunmber[]
const a2 = [1, 2, 3] as const;  // 타입: readonly [1, 2, 3]
```

### 요약

- 타입스크립트가 `넓히기`를 통해 상수의 타입을 명확성과 유연성 사이에서 균형을 유지하며 추론한다.
- 동작에 영향을 주는 방법인 `const`, 타입 구문, 문맥, `as const`에 익숙해지자.