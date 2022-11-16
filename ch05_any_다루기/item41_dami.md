# 아이템 41. any의 진화를 이해하기

타입스크립트에서 변수의 타입은 변수를 선언할 때 결정되고, 이후 `null` 값 체크 등을 통해 정제될 수 있으나, 타입을 확장할 수는 없습니다.
하지만 `any` 타입과 관련해서 예외인 경우가 존재합니다.

## 배열에서의 타입 변화 예시

```typescript
function range(start: number, limit: number) {
  const out = []; // 타입이 any[]
  for (let i = start; i < limit; i++) {
    out.push(i); // Out의 타입이 any[]
  }
  return out; // 타입이 number[]
}
```

위 예제에서는 처음엔 `any` 타입 배열로 초기화 되었으나, 마지막에는 `number[]`로 추론되고 있습니다.

out의 타입은 `any[]`로 선언되었지만 number타입의 값을 넣는 순간부터 타입은 `number[]`로 진화합니다.

<br/>

## 분기에 따른 타입 변화 예시

```typescript
let val; // 타입이 any
if (Math.random() < 0.5) {
  val = /hello/;
  val; // 타입이 RegExp
} else {
  val = 12;
  val; // 타입이 number
}
val; // 타입이 number | RegExp
```

위 예제에서는 분기에 따라 타입이 변화합니다.

<br/>

## try/catch 블록 내 타입 변화 예시

```typescript
function somethingDangerous() {}
let val = null; // 타입이 any
try {
  somethingDangerous();
  val = 12;
  val; // 타입이 number
} catch (e) {
  console.warn("alas!");
}
val; // 타입이 number | null
```

변수의 초깃값이 `null`인 경우도 `any`의 진화가 일어나는데, 보통은 `try/catch` 블록 안에서 변수를 할당하는 경우에 나타납니다.

<br/>

## any가 유지되는 경우

`any`는 `noImplictAny`가 설정된 상태에서 변수의 타입이 암시적으로 `any`인 경우에만 일어나지만, 다음처럼 명시적으로 `any`를 선언하면 타입이 그대로 유지됩니다.

```typescript
function range(start: number, limit: number) {
  const out = []; // 타입이 any[]
  for (let i = start; i < limit; i++) {
    out.push(i); // 타입이 any[]
  }
  return out; // 타입이 number[]
}
```

<br/>

## 암시적 any 오류

```typescript
function range(start: number, limit: number) {
  const out = [];
  //    ~~~'out' 변수는 형식을 확인할 수 없는 경우 일부 위치에서 암시적으로 'any[]' 형식입니다.
  if (start === limit) {
    return out;
    //     ~~~ 'out' 변수에는 암시적으로 'any[]' 형식이 포함됩니다.
  }
  for (let i = start; i < limit; i++) {
    out.push(i);
  }
  return out;
}
```

### 암시적 any 타입은 함수 호출을 거쳐도 진화하지 않는다.

```typescript
function makeSquares(start: number, limit: number) {
  const out = [];
  // 'out' 변수는 일부 위치에서 암시적으로 'any[]' 형식입니다.
  range(start, limit).forEach((i) => {
    out.push(i * i);
  });
  return out;
  // ~~~ 'out' 변수에는 암시적으로 'any[]' 형식이 포함됩니다.
}
```

위 예제에서 `forEach`안의 화살표 함수는 추론에 영향을 미치지 않습니다. 루프를 순회하는 대신 배열의 `map`과 `filter` 메서드를 통해 단일 구문으로 배열을 생성하여 `any` 전체를 진화시키는 방법을 생각해 볼 수 있습니다.

`any`가 진화하는 방식은 일반적인 변수가 추론되는 원리와 동일합니다. 따라서 암시적으로 any를 진화시키는 것 보다 명시적 타입 구문을 사용하는 것이 더 좋은 설계입니다.

<br/>

# 결론

- 암시적 any, any[] 타입은 진화할 수 있다는 걸 알고 작성하자.
- any를 진화시키는 것보다 명시적 타입 구문을 쓰는 것이 좋다.
