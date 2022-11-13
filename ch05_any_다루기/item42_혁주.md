# 모르는 타입의 값에는 any 대신 unknown을 사용하기

#### unknown

- 함수의 반환값과 관련된 형태
- 변수 선언과 관련된 형태
- 단언문과 관련된 형태

### 함수의 반환값과 관련된 unknown

YAML 파서인 parseYAML 함수를 작성한다고 가정해 보겠습니다.

```typescript
function parseYAML(yaml: string): any {}
```

함수의 반환 타입으로 any를 사용하는 것은 좋지 않은 설계입니다.
대신 parseYAML을 호출한 곳에서 반환값을 원하는 타입으로 할당하는 것이 이상적입니다.

```typescript
const book: Book = parseYAML(`
  name: 11st
  author: Dcron
`);
```

그러나 함수의 반환값에 타입 선언을 강제할 수 없기 때문에, **호출한 곳에서 타입 선언을 생략하게 되면** book 변수는 암시적 any 타입이 되고, 사용되는 곳마다 타입 오류가 발생하게 됩니다.

```typescript
const book1 = parseYAML(`
  name: 11st
  author: Bad
`);

alert(book1.title); // 오류가 발생해야 하는데, 발생하지 않음 -> 런타임에 undefined 경고
book1('read'); // 오류가 발생해야 하는데, 발생하지 않음 -> 런타임에 TypeError 발생
```

대신 parseYAML이 unknown 타입을 반환하게 만드는 것이 더 안전합니다.

```typescript
function safeParseYAML(yaml: string): unknown {
  return parseYAML(yaml);
}

const book = safeParseYAML(`
  name: The Tenant of Wildfell Hall
  author: Anne
`);

alert(book.title); // ~~ 객체가 unknown 타입입니다.
book('read'); // ~~ 객체가 unknown 타입입니다.
```

unknown을 이해하기 위해 **할당 가능성의 관점**에서 any를 생각해 볼 필요가 있습니다.

any가 위험한 이유는 무엇일까요?

1. 어떠한 타입이든 any 타입에 할당 가능하다.
2. any 타입은 어떠한 타입으로도 할당 가능하다. (never 타입은 예외)

한 집합은 다른 모든 집합의 부분 집합이면서 동시에 상위집합이 될 수 없기 때문에, any는 타입 시스템과 상충되는 면을 가지고 있습니다.
타입 체커는 집합 기반이기 때문에 any를 사용하면 타입 체커가 무용지물이 되어버립니다.

`unknown`은 any 대신 쓸 수 있는 타입 시스템에 부합하는 타입입니다.

- unknown 타입은 어떠한 타입이든 unknown에 할당 가능(any의 1번 속성 만족)
- unknown은 오직 unknown과 any에만 할당 가능(any의 2번 속성 만족 x)

`never` 타입은 unknown과 정반대입니다.

- 어떠한 속성도 never에 할당할 수 없음(any의 1번 속성 만족 x)
- 어떠한 타입으로도 할당 가능(any의 2번 속성 만족)

unknown 타입인 채로 값을 사용하면 오류가 발생합니다. 따라서 적절한 타입으로 변환하도록 강제할 수 있습니다.

```typescript
const book = safeParseYAML(`
  name: grit
  author: flow
`) as Book;

alert(book.title); // ~~ title이 Book type안에 없다.
book('read'); // ~~ 이 식은 호출할 수 없다.
```

애초에 반환값이 Book 이라고 기대하며 함수를 호출하기 때문에 단언문은 문제가 되지 않습니다.
Book 타입 기준으로 타입 체크가 되기 때문에, unknown 타입 기준으로 오류를 표시했던 예제보다 오류의 정보가 더 정확해집니다.

### 변수 선언과 관련된 unknown

어떠한 값이 있지만 그 타입을 모르는 경우에 unknown을 사용합니다.

```typescript
interface Feature {
  id?: string | number;
  geometry: Geometry;
  properties: unknown; // 잡동사니 주머니 느낌
}
```

unknown을 원하는 타입으로 변경하는 방법에는 타입 단언문 말고도 다른 방법이 있습니다.
instanceof를 체크한 후 unknown에서 원하는 타입으로 변환할 수 있습니다.

```typescript
function processValue(val: unknown) {
  if (val instanceof Date) {
    val; // type이 Date
  }
}
```

타입 가드를 사용할 수도 있습니다.

```typescript
function isBook(val: unknown): val is Book {
  return (
    typeof val === 'object' && val !== null && 'name' in val && 'author' in val // null === 'object'임 주의
  );
}

function processValue(val: unknown) {
  if (isBook(val)) {
    val;
  }
}
```

가끔 unknown 대신 제네릭 매개변수가 사용되는 경우도 있습니다. 제너릭을 사용하기 위해 다음 코드처럼 safeParseYAML 함수를 선언할 수 있습니다.

```typescript
function safeParseYAML<T>(yaml: string): T {
  return parseYAML(yaml);
}
```

그러나 일반적으로 타입스크립트에서 좋지 않은 스타일입니다.
제너릭을 사용한 스타일은 타입 단언문과 생김새는 달라보이지만 기능적으로는 동맇바니다.
제너릭보다 unknown을 반환하고 사용자가 직접 단언문을 사용하거나 원하는대로 타입을 좁히도록 강제하는 것이 좋습니다.

### 단언문과 관련된 unknown

이중 단언문에서 any 대신 unknown을 사용할 수도 있습니다.

```typescript
declare const foo: Foo;
let barAny = foo as any as Bar;
let barUnk = foo as unknown as Bar;
```

기능적으로는 동일하지만, 나중에 두 개의 단언문을 분리하는 리팩터링을 한다면 unknown 형태가 더 안전합니다.
any의 경우 분리되는 순간 그 영향력이 전염병처럼 퍼지게 됩니다.
unknown의 경우 분리되는 즉시 오류가 발생하여 더 안전합니다.

### unknown과 유사한 타입들

`object` 또는 `{}`를 사용하는 코드들도 존재합니다.

- `{}` 타입은 `null`과 `undefined`를 제외한 모든 값을 포합합니다.
- `object` 타입은 모든 비기본형(`non-primitive`) 타입으로 이루어집니다. 여기에는 `true` 또는 `12` 또는 `'foo'`가 포함되지 않지만 `객체`, `배열`은 포함됩니다.

`unknown` 타입이 도입되기 이전에는 `{}`가 일반적으로 많이 쓰였지만, 최근에는 `{}`를 사용하는 경우가 드뭅니다.
정말로 `null`과 `undefined`가 불가능하다고 판단되는 경우에만 `unknown` 대신 `{}`를 사용하면 됩니다.

## 요약

`unknown` 타입은 `any` 대신 사용할 수 있는 안전한 타입입니다. 어떠한 값이 있지만 그 타입을 알지 못하는 경우 사용합니다.
사용자가 타입 단언문이나 타입 체크를 사용하도록 강제하려면 `unknown`을 사용하면 됩니다.
`{}`, `object`, `unknown`의 차이점을 이해해야 합니다.
