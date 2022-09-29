# 아이템 7. 타입이 값들의 집합이라고 생각하기

### type

'할당 가능한 값들의 집합'을 '타입' 또는 '타입의 범위'라고 한다.

- 모든 숫자값의 집합: `number` 타입
  - `null`과 `undefined`는 `strictNullChecks` 여부에 따라 `number`에 해당될 수도 아닐 수도 있다.
  - `type score = number;`
- 아무 값도 포함하지 않는 공집합: `never` 타입
- 한 가지 값만 포함하는 타입: `unit` 또는 `literal` 타입
  - `type A = 'A';`
  - `type FourtyTwo = 42;`
- 두개 혹은 세개의 이상의 값으로 묶인 타입:  `union` 타입
  - `type AB = 'A' | 'B';`

### interface

`interface`를 이용해서 원소를 서술하는 방법도 존재한다.

```typescript
interface Identified {
    id: string;
}
```

두 타입의 교집합(intersection)을 계산하는 연산자는 `&` 연산자이다. 인터섹션 연산자는 각 타입 내의 속성을 모두 포함하는 것이 일반적인 규칙이다.

```typescript
interface Person {
    name: string;
}
interface Lifespan {
    birth: Date;
    death?: Date;
}
type PersonSpan = Person & Lifespan;

const ps: PersonSpan = {
    name: 'Alan Turing',
    birth: new Date('1912/06/23'),
    death: new Date('1954/06/07'),
}
```

두 인터페이스의 유니온에서는 속성에 대한 인터섹션을 하는것이 규칙이다. 따라서 아래 코드에서 유니온 타입에 속하는 값은 어떠한 키도 없기 떄문에, 유니온에 대한 keyof는 공집합(never)이어야 한다.

```typescript
type K = keyof (Person | Lifesapn);
```

> 참고
> 
> keyof (A&B) = (keyof A) | (keyof B)
> 
> keyof (A|B) = (keyof A) & (keyof B)

조금 더 일반적으로 `PersonSpan`을 선언하는 방법은 `extends` 키워드를 사용하는 방법이 있다. 

```typescript
interface Person {
    name: string;
}

interface PersonSpan extends Person {
    birth: Date;
    death?: Date;
}
```

`extends` 키워드는 제네릭 타입에서 한정자로도 쓰인다. `K`는 `string`의 부분 집합 범위를 가지는 어떠한 타입이다.

```typescript
function getKey<K extends string>(val: any, key: K) {
    // ...
}
```

### Quiz

1. 다음 선언문은 컴파일 오류가 나지 않는다. (O / X)

```typescript
const x: never = 12;
```

<details>
<summary>정답</summary>
    
**정답: X**

```typescript
const x: never = 12;
  // ~ '12' 형식은 'never' 형식에 할당할 수 없습니다.
```

never 타입으로 선언된 변수의 범위는 공집합이기 때문에 아무런 값도 할당할 수 없다. (p.39)
</details>

---

2. 다음 중 컴파일 오류가 나지 않는 것들을 골라보자.

```typescript
interface Point {
    x: number;
    y: number;
}
type PointKeys = keyof Point;

function sortBy<K extends keyof T, T>(vals: T[], key: K): T[] {
    // ...
}
const pts: Point[] = [{x: 1, y:1}, {x: 2, y: 0}]
```

1. sortBy(pts, '')
2. sortBy(pts, 'x')
3. sortBy(pts, 'y')
4. sortBy(pts, Math.random() < 0.5 ? 'x' : 'y')
5. sortBy(pts, 'z')

<details>
<summary>정답</summary>
    
**정답: 2,3,4**

```typescript
// 'x' | 'y'
type PointKeys = keyof Point;
```

</details>

---

3. 다음 선언문은 typescript 컴파일 에러가 나지 않는다. (O / X)

```typescript
const tuple_1: [number, number] = [1,2];
const list_1: number[] = tuple_1
```

<details>
<summary>정답</summary>
    
**정답: O**

타입스크립트는 숫자의 쌍을 `{0: number, 1: number, length: 2}`로 모델링하고, 튜플을 `{0: number, 1: number}`로 모델링한다.
</details>

### 참고

- [keyof result contains undefined when used on mapped type with optional properties](https://github.com/microsoft/TypeScript/issues/34992)
