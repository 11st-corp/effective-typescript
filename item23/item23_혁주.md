# 한꺼번에 객체 생성하기

객체를 생성할 때는 속성을 하나씩 추가하기보다는 여러 속성을 포함해서 한꺼번에 생성해야 타입 추론에 유리합니다.

자바스크립트에서 2차원 점을 표현하는 객체를 생성한다고 가정하겠습니다.

```typescript
const pt = {};
pt.x = 3;
pt.y = 4;
```

타입스크립트에서는 각 할당문에 오류가 발생합니다.

```typescript
const pt = {};
pt.x = 3;
// ~ '{}' 형식에 'x' 속성이 없습니다.
pt.y = 4;
// ~ '{}' 형식에 'y' 속성이 없습니다.
```

- 원인: 첫 번재 줄의 pt 타입은 {} 값을 기준으로 추론되기 때문입니다. 존재하지 않는 속성을 추가할 수는 없습니다.

만약 Point 인터페이스를 정의한다면 오류가 다음처럼 바뀝니다.

```typescript
interface Point {
  x: number;
  y: number;
}
const pt: Point = {};
// ~ '{}' 형식에 'Point' 형식의 x, y 속성이 없습니다.
pt.x = 3;
pt.y = 4;
```

이 문제들은 객체를 한번에 정의하면 해결할 수 있습니다.

```typescript
const pt = {
  x: 3,
  y: 4,
};
```

객체를 반드시 제각각 나눠서 만들어야 한다면, 타입 단언문을 사용해 타입 체커를 통과하게 할 수 있습니다.

```typescript
const pt = {} as Point;
pt.x = 3;
pt.y = 4;
```

물론 이 경우에도 선언할 떄 객체를 한꺼번에 만드는 게 더 낫습니다.

```typescript
const pt: Point = {
  x: 3,
  y: 4,
};
```

작은 객체들을 조합해서 큰 객체를 만들어야 하는 경우에도 여러 단계를 거치는 것은 좋지 않은 생각입니다.

```typescript
const pt = { x: 3, y: 4 };
const id = { name: 'Pythagoras' };
const namedPoint = {};
Object.assign(namedPoint, pt, id);
namedPoint.name;
// ~ '{}'형식에 'name' 속성이 없습니다.
```

다음과 같이 `객체 전개 연산자` ... 를 사용하면 큰 객체를 한꺼번에 만들어 낼 수 있습니다.

```typescript
const namedPoint = { ...pt, ...id };
namedPoint.name; //정상, 타입이 string
```

객체 전개 연산자를 사용하면 타입 걱정 없이 필드 단위로 객체를 생성할 수도 있습니다. 이때 모든 업데이트마다 새 변수를 사용하여 각각 새로운 타입을 얻도록 하는 게 중요합니다.

```typescript
const pt0 = {};
const pt1 = { ...pt0, x: 3 };
const pt: Point = { ...pt1, y: 4 };
```

- 이 방법은 간단한 객체를 만들기 위해 우회하기는 했지만, 객체에 속성을 추가하고 타입스크립트가 새로운 타입을 추론할 수 있게 해 유용합니다.

### 조건부 속성 추가

타입에 안전한 방식으로 조건부 속성을 추가하려면, 속성을 추가하지 않는 `null` 또는 `{}`으로 객체 전개를 사용하면 됩니다.

```typescript
declare let hasMiddle: boolean;
const firstLast = { first: 'Harry', last: 'truman' };
const president = { ...firstLast, ...(hasMiddle ? { middle: 'S' } : {}) };
```

president 심벌에 마우스를 올려보면, 다음과 같이 표시됩니다.
middle이 선택적 속성을 가진 것으로 추론이 되는 것을 확인할 수 있습니다.

<img width="360" alt="스크린샷 2022-10-11 오후 9 41 54" src="https://user-images.githubusercontent.com/76726411/195096030-3ec32543-9b10-4579-b03f-dec196c215e3.png">

전개 연산자로 한꺼번에 여러 속성을 추가할 수도 있습니다.

```typescript
declare let hasDates: boolean;
const nameTitle = { name: 'Khufu', title: 'Pharaoh' };
const pharaoh = {
  ...nameTitle,
  ...(hasDates ? { start: -2589, end: -2566 } : {}),
};
```

편집기에서 pharaoh 심벌에 마우스를 올리면 다음과 같이 표시됩니다.

<img width="342" alt="스크린샷 2022-10-11 오후 9 42 11" src="https://user-images.githubusercontent.com/76726411/195096628-d4d96c5b-17d3-4813-9581-810b0318126e.png">

그러나 책에서는 다음과 같이 타입이 유니온으로 추론된다고 적혀있는데요,

```typescript
const pharaoh:
  | {
      start: number;
      end: number;
      name: string;
      title: string;
    }
  | {
      name: string;
      title: string;
    };
```

이렇게 차이가 나는 이유는 타입스크립트가 활발히 업데이트되고 있는 언어이기 때문입니다. 따라서 너무 책만보고 공부를 하다보면 예전에는 옳았던 것들이 지금은 틀린 것이 될 수 있겠습니다.

##요약

- 속성에 제각각 추가하지 말고 한꺼번에 객체로 만들어야 합니다. 안전한 타입으로 속성을 추가하려면 객체 전개({...a, ...b})를 사용하면 됩니다.
- 객체에 조건부로 속성을 추가하는 방법을 익히도록 합니다.
