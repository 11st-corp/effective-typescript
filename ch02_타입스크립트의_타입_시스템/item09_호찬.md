# 아이템 7. 타입 단언보다는 타입 선언을 사용하기

### 타입 단언과 타입 선언

아래 코드에서 `alice`는 타입 선언, `bob`은 타입 단언이다.

```typescript
interface Person {
    name: string;
};

// 타입 선언
const alice: Person = {
    name: 'Alice',
};
// 타입 단언
const bob = {
    name: 'Bob',
} as Person;
const bob2 = <Person>{
    name: 'Bob2',
}
```

### 타입 단언을 지양해야하는 이유

```typescript
interface Person {
    name: string;
};

const alice: Person = {}; // Property 'name' is missing in type '{}' but required in type 'Person'.ts(2741)
const bob = {} as Person
```

타입 단언은 타입스크립트가 추론한 타입이 있더라도 단언된 타입으로 간주된다. `bob`에서는 오류가 발생하지 않는데, 타입 단언을 했으니 타입 체커에게 오류를 무시하라고 했기 떄문이다.

속성을 추가하는 경우에도 마찬가지이다. 타입 선언에서는 `잉여 속성 체크`가 동작하지만, 타입 단언에서는 동작하지 않기 때문이다.

```typescript
interface Person {
    name: string;
};

const alice: Person = {
    name: 'Alice',
    occupation: 'TypeScript developer',
    // Type '{ name: string; occupation: string; }' is not assignable to type 'Person'. 
    // Object literal may only specify known properties, and 'occupation' does not exist in type 'Person'.ts(2322)
};

const bob = {
    name: 'Bob',
    occupation: 'Javascript developer',
} as Person;
```

### 타입 단언을 사용하는 경우

타입스크립트는 DOM에 접근할 수 없다.

```typescript
document.querySelector('#myButton').addEventListener('click', e => {
    // e.currentTarget의 타입은 EventTarget
    // button의 타입은 HTMLButtonElement
    const button = e.currentTarget as HTMLButtonElement;
})
```

타입스크립트가 알지 못하는 정보를 우리는 알고 있기 때문에, 위 코드에서 타입 단언문을 사용하는 것은 타당하다.

### `!`

```typescript
const elNull = document.getElementById('foo'); // 타입은 HTMLElement | null
const el = document.getElementById('foo')!; // 타입은 HTMLElement
```

- 접두사로 쓰인 !는 boolean의 부정문이다.
- 접미사로 쓰인 !는 그 값이 null이 아니라는 단언문이다.

### 요약

- 타입 단어(`as Type`)보다 타입 선언(`: Type`)을 사용하자.
- 타입스크립트보다 타입 정보를 더 잘 알고 있는 상황에서는 타입 단언문과 null 아님 단언문을 사용하자.