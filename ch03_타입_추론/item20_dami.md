# 아이템 20. 다른 타입에는 다른 변수 사용하기

 

## 변수를 여러 타입으로 재사용할 경우 생기는 문제

자바스크립트에서는 한 변수를 다른 목적을 가지는 다른 타입으로 재사용해도 되지만, 타입스크립트에서는 오류가 발생합니다.

### 자바스크립트

```typescript
let id = '12-34-56';
fetchProduct(id); //string으로 사용
id = 123456;
fetchProductBySeriaNumber(id); //number로 사용
```



### 타입스크립트

```typescript
let id = '12-34-56';
fetchProduct(id); 
id = 123456;
// 에러: ~~ '123456' 형식은 'string' 형식에 할당할 수 없습니다.
fetchProductBySeriaNumber(id);
// 에러: ~~ 'string' 형식의 인수는 'number' 형식의 매개변수에 할당될 수 없습니다.
```



편집기에서 타입스크립트는 '12-34-56' 을 보고 id 타입을 `string`으로 추론했고 `string` 타입에는 `number`타입을 할당할 수 없기 때문에 오류가 발생합니다.

### 변수의 값은 바뀔 수 있지만 그 타입은 보통 바뀌지 않는다

- 타입을 바꿀 수 있는 한 가지 방법은 **범위를 좁히는 것** (아이템 22) 입니다.
  - 새로운 변수값을 포함하도록 확장하는 것이 아니라 타입을 **더 작게 제한하는 것**입니다. -> **타입 지정 방법**(아이템 41)은 이 관점에 반하는데, 어디까지나 예외이지 규칙은 아닙니다.



## 변수를 여러 타입으로 재사용할 경우 생기는 문제 해결

앞서 오류가 발생한 예제에서 id의 타입을 바꾸지 않고 문제를 해결하기 위해서는 `유니온(union)` 타입을 사용해 `string` 과 `number`를 모두 포함할 수 있도록 타입을 확장하면 됩니다.

### 유니온 타입

```typescript
let id: string|number = '12-34-56'; // string
fetchProduct(id);
id = 123456; // 정상 
fetchProductBySeriaNumber(id); // 정상 - number
```

유니온 타입으로 에러를 제거할 수 있지만, id를 사용할 때마다 값이 어떤 타입인지 확인해야 하기 때문에 오히려 더 많은 문제를 야기할 수 있습니다. 따라서 두 값이 관련이 없다면 별도의 변수에 할당하는 것이 낫습니다.



### 변수에 할당

```typescript
const id: string|number = '12-34-56'; 
fetchProduct(id);

const serial = 123456; // 정상
fetchProductBySeriaNumber(id); // 정상 
```



### 변수 사용의 장점

- 서로 관련이 없는 두 개의 값을 분리합니다(`id`와 `serial`).
- 변수명을 더 구체적으로 지을 수 있습니다.
- 타입 추론을 향상시키며, 타입 구문이 불필요해집니다.
- 타입이 좀 더 간결해집니다(`string | number` 대신 `string`과 `number`를 사용).
- `let` 대신 `const`로 변수를 선언할 수 있습니다. 변수를 `const`로 선선하면 코드가 간결해지고, 타입 체커가 타입을 추론하기에도 좋습니다. 

타입이 바뀌는 변수는 되도록 피해야하며, 목적이 다른 곳에는 별도의 변수명을 사용해야 합니다. 그런데 재사용 되는 변수와, 다음 예제 내 `가려지는(shadowed)` 변수를 혼동해서는 안 됩니다.



### 가려지는(shadowed) 변수

```typescript
const id = '12-34-56';
fetchProduct(id);
{
  const id = 123456; // 정상
  fetchProductBySerialNumber(id); //정상
}
```

- 두 `id`는 이름이 같지만 실제론 관계가 없기에 각 `id`에 다른 타입을 사용해도 잘 동작하지만, 이 방식은 다른 개발자에게 혼란을 줄 수 있습니다.

- 따라서 목적이 다른 곳에는 별도의 변수명을 사용하는 것이 좋습니다.

- 많은 개발팀에서는 lint 규칙을 통해 가려지는(shadowed) 변수를 사용하지 못하도록 하고 있습니다.

  - 참고

    [ESLint no-shadow](https://eslint.org/docs/latest/rules/no-shadow)

    Disallow variable declarations from shadowing variables declared in the outer scope




## 결론

- 변수의 값은 바뀔 수 있으나, 타입은 일반적으로 바뀌지 않습니다.
- 타입이 다른 값을 다룰 때는 변수를 재사용하지 말고, 그 값에 맞는 변수를 생성합시다.
