# 아이템 39. any를 구체적으로 변형해서 사용하기

`any`는 자바스크립트에서 표현할 수 있는 모든 값을 아우르는 매우 큰 범위의 타입이다. 반대로 생각하면, 일반적인 상황에서는 `any`보다 **구체적으로 표현할 수 있는 타입이 존재할 가능성이 높기 떄문에 더 구체적인 타입을 찾아 타입 안전성을 높여야 한다.**

```typescript
function getLengthBad(array: any) { // bad
  return array.length;
}

function getLength(array: any[]) {
  return array.length;
}
```

`getLength`는 아래 3가지 이점을 갖는다.

- 함수 내의 array.length 타입이 체크된다.
- 함수의 반환 타입이 any 대신 number로 추론된다.
- 함수 호출될 때 매개변수가 배열인지 체크된다.

### 값을 알 수 없는 객체

함수의 매개변수가 객체이긴하지만 값을 알 수 없을때는 `{[key: string]: any}`처럼 선언하자.

```typescript
function hasTweleveLetterKey(o: {[key: string]: any}) {
  for (const key in o) {
    if (key.length === 12) {
      return true;
    }
  }
  return false;
}
```

객체의 값을 알 필요가 없다면, 모든 비기본형(non-primitive) 타입을 포함하는 `object` 타입을 사용할 수 있다. **`object` 타입을 객체의 키를 열거할 수 있지만, 속성에 접근할 수 없다는 점에서 `{[key: string]: any}`와 차이가 있다.**

```typescript
function hasTweleveLetterKey(o: object) {
  for (const key in o) {
    if (key.length === 12) {
      console.log(key, o[key]); // '{}' 형식에 인덱스 시그니처가 없으므로 요소에
                                // 요소에 암시적으로 'any' 형식이 있습니다.
    }
  }
  return false;
}
```

### 함수의 타입

함수의 타입에도 `any`를 사용하기보다는 아래처럼 조금이라도 구체화를 시키자.

```typescript
type Fn0 = () => any;                // 매개변수 없이 호출 가능한 모든 함수
type Fn1 = (arg: any) => any;        // 매개변수 1개
type Fn2 = (...args: any[]) => any;  // 모든 개수의 매개변수, "Function" 타입과 동일
```

적어도 `any`보다는 구체적이다.

```typescript
const numArgsBad = (...args: any) => args.length;    // any를 반환
const numArgsGood = (...args: any[]) => args.length; // number를 반환
```

### 결론

- `any`를 사용할 때는 정말로 모든 값이 허용되어야 하는지 면밀히 검토해야한다.
- `any`보다 더 정확히 모델링 할 수 있도록 `any[]`, `{[id: string]: any}` 또는 `() => any` 처럼 구체적인 형태를 사용하자.