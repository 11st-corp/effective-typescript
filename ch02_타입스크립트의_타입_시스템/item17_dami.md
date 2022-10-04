# 아이템 17. 변경 관련된 오류 방지를 위해 readonly 사용하기



```typescript
function arraySum(arr: number[]) {
  let sum = 0, num;
  while ((num = arr.pop()) !== undefined) {
    sum += num;
  }
  return sum;
}
```

위 함수는 배열 안의 숫자를 모두 합치는 계산이 끝나면 원래 배열은 전부 비게됩니다. 자바스크립트는 배열의 내용을 변경할 수 있기 때문에, 타입스크립트에서도 오류가 발생하지 않습니다.

위 함수가 배열을 변경했을 때 발생할 수 있는 오류의 범위를 좁히기 위해 `readonly` 접근 제어자를 사용하여 `arraySum`이 배열을 변경하지 않는다는 선언을 할 수 있습니다.

```typescript
function arraySum(arr: readonly number[]) {
  let sum = 0, num;
  while ((num = arr.pop()) !== undefined) {
    // 에러: ~~'readonly number[]' 형식에 'pop' 속성이 없습니다.
    sum += num;
  }
  return sum;
}
```



##  `readonly number[]`가 `number[]`와 구분되는 몇 가지 특징 

- 배열의 요소를 읽을 수 있지만, 쓸 수는 없다.
- `length`를 읽을 수 있지만, 바꿀 수는 없다.
- 배열을 변경하는 메서드를 호출할 수 없다. (예: pop)

`number[]`는 `readonly number[]` 보다 기능이 많기 때문에, `readonly number[]`의 서브타입이 됩니다. (아이템 7 참고) 

따라서 변경 가능한 배열을 `readonly` 배열에 할당할 수 있습니다. 하지만 그 반대는 불가능합니다.

```typescript
const a: number[] = [1, 2, 3];
const b: readonly number[] = a; // 에러 발생 x 
const c: number[] = b; // 에러 발생 O
// ~ 'readonly number[]' 타입은 'readonly'이므로
// 변경 가능한 'number[]' 타입에 할당될 수 없습니다.
```



## 매개변수를 `readonly`로 선언하면 생기는 일

- 타입스크립트는 매개변수가 함수 내에서 변경이 일어나는지 체크한다.
- 호출하는 쪽에서는 함수가 매개변수를 변경하지 않는다는 보장을 받는다.
- 호출하는 쪽에서 함수에 `readonly 배열`을 매개변수로 넣을 수도 있다.

자바스크립트, 타입스크립트에서는 함수가 매개변수를 변경하지 않는다고 가정하나, 이런 암묵적인 방법이 타입 체크에 문제를 일으킬 수 있습니다. (아이템 30, 31에서 계속) 따라서 명시적인 방법을 사용하는 것이 컴파일러와 사람 모두에게 좋습니다.

앞서 작성했던 arraySum 함수는 배열을 변경하지 않는 방법으로 수정하여 에러를 해결할 수 있습니다.

```typescript
function arraySum(arr: readonly number[]) {
  let sum = 0;
  for (const num of arr) {
    sum += num;
  }
  return sum;
} 
```



### `readonly`로 선언했을 때의 장점 

- 더 넓은 타입으로 호출 할 수 있다. (아이템 29)
- 의도치 않은 변경은 방지된다.
  - 지역 변수와 관련된 모든 종류의 변경 오류를 방지할 수 있다.



### `readonly`로 선언했을 때의 단점 

- 매개변수가 `readonly`로 선언되지 않은 함수를 호출해야 할 경우도 있다.
  - 해결) 그 함수가 매개변수를 변경하지 않는 함수라면 `readonly`로 선언하면 된다.
- 어떤 함수를 readonly로 만들면, 그 함수를 호출하는 다른 함수도 모두 `readonly`로 만들어야 한다.
  - 해결) 이를 통해 인터페이스를 명확히 하고 타입 안정성을 높일 수 있기 때문에 단점이라고 볼 수만은 없다. 만약 다른 라이브러리에 있는 함수를 호출하는 경우라면, 타입 선언을 바꿀 수 없기에 `타입 단언문(as number[])`을 사용해야 한다.



### `readonly`로 선언시 발생하는 문제 해결 예시

```typescript
function parseTaggedText(lines: string[]): string[][] {
  const currPara: readonly string[] = [];
  const paragraph: string[][] = [];
  ...
  paragraph.push(currPara) // 에러(1): ~~ 'readonly string[]' 형식의 인수는 'string[]' 형식의 매개변수에 할당될 수 없습니다.
  ...
  currPara.length = 0; // 에러(2): ~~ 읽기 전용 속성이기 때문에 'length'에 할당할 수 없습니다.
  ...
  curPara.push(line); // 에러(3): ~~ 'readonly string[]' 형식에 'push' 속성이 없습니다.
}
```

위 오류를 바로 잡는 방법은 세 가지입니다.

1. `currPara`의 복사본을 만드는 방법
2. `paragraphs(그리고 함수의 반환 타입)`를 `readonly string[]`의 배열로 변경하는 방법
3. 배열의 `readonly` 속성을 제거하기 위해 단언문을 쓰는 방법



## `readonly`는 얕게(shallow) 동작한다.

```typescript
interface Outer {
  inner: {
    x: number;
  }
}
const o: Readonly<Outer> = {inner: {x: 0}};
o.inner = { x: 1};  // 에러: ~~ 읽기 전용 속성이기 때문에 'inner'에 할당할 수 없습니다.
o.inner.x = 1; // 정상
```

`readonly`는 얕게(shallow) 동작한다는 것에 유의하며 사용해야 합니다. 현재 시점에는 깊은(deep) `readonly` 타입이 기본으로 지원되지 않지만, 제너릭을 만들면 깊은 `readonly`타입을 사용할 수 있습니다. 그러나 이는 까다롭기에 라이브러리를 사용하는 게 낫습니다. (Ts-essentials 내 DeepReadonly 제너릭)



## const, readonly - 공통점

const와 readonly는 초기 때 할당된 값을 변경할 수 없습니다.



## const, readonly - 차이점

### Const

- 변수 참조를 위한 것입니다.
- 변수에 다른 값을 할당할 수 없습니다.

```typescript
const eleven = 11
eleven = '11st' // 불가
```

### readonly

- 속성을 위한 것입니다.

```typescript
type eleven = {
  readonly name: string
};

const x: eleven = {name: '11st'}; 
x.name = '12st'; // 불가
```



## 인덱스 시그니처에 `readonly` 활용

```typescript
let obj: {readonly [k: string]: number} = {};
```

인덱스 시그니처에도 `readonly`를 쓸 수 있습니다. 인덱스 시그니처에 `readonly`를 사용하면 객체의 속성이 변경되는 것을 방지할 수 있습니다.



## 결론 

- 변경으로 발생한 오류를 방지하고, 변경이 발생하는 코드도 쉽게 찾을 수 있습니다.
- `readonly`는 얕게 동작합니다.
- `const`와 `readonly`의 차이를 이해해야합니다.