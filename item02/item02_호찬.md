# 아이템 2. 타입스크립트 설정 이해하기

### 설정 적용 방법

타입스크립트에는 `커맨드 라인`과 `tsconfig.json` 설정 적용 방법이 있습니다.

1. 커맨드 라인

```bash
tsc --noImplicitAny program.ts
```

2. tsconfig.json

```json
{
    "compilerOptions": {
        "noImplicitAny": true
    }
}
```

> `tsc --init`을 통해 기본 `tsconfig.json` 파일을 생성할 수 있습니다.

### Strictness

일부 사용자들은 `타입 검사`와는 다른 기능들을 경험하기 위해 `Typescript`를 사용하며, 느슨한 설정을 원합니다. 여러 타입 검사 설정들은 선택사항입니다. 예를들어, `null`나 `undefined` 같은 기본 값들을 검사하지 않게 설정할 수 있습니다. 기존 JavaScript를 마이그레이션하는 경우 이는 바람직한 첫 단계입니다.

많은 `Typescript` 사용자들은 가능한 한 즉시 유효성을 검사하는 것을 선호하며 이것이 언어가 `Strictness`을 제공하는 주요 이유중 하나입니다.

TypeScript는 기본적으로 모든 flag들이 활성화됩니다. 

`tsconfig.json`에서 `"strict": true`을 사용해 모든 `strict flag`들을 동시에 켤 수 있습니다. `strict flag` 중 알아야 할 가장 큰 두 가지는 `noImplicitAny` 및 `strictNullChecks`입니다.

#### `noImplicitAny`

`any`를 사용하는것은 `Typescript`를 사용하는 목적을 무효화하는 경우가 많습니다. 프로그램은 타입이 많을수록 더 많은 유효성 검사를 할 수 있으므로, 코드 작성 시 버그가 더 적게 발생합니다.

```ts
function add(a, b) { 
// Parameter 'a' implicitly has an 'any' type.ts(7006)
// Parameter 'b' implicitly has an 'any' type.ts(7006)
    return a + b;
}

function subtract(a: number, b: number) {
    return a - b;
}
```

#### `strictNullChecks`

기본적으로 `null`및 같은 값 `undefined`은 다른 유형에 할당할 수 있습니다.

```ts
const x: number = null; 
```

이렇게 하면 일부 코드를 더 쉽게 작성할 수 있지만 `null`, `undefined`을 처리하는 것을 잊어버려서 수많은 버그의 원인이 될 수 있습니다.

`strictNullChecks` 옵션은 `null`, `undefined` 관련된 오류를 잡아내는 데 많은 도움을 줍니다.

```ts
const x: number = null; // type 'null' is not assignable to type 'number'.ts(2322)
```

오류의 해결 방법으로는 아래 두 가지가 있습니다. 

1. 의도적으로 명시해서 null 허용 가능합니다.

```ts
const x: number | null = null; 
```

2. `null` 값을 허용하기를 원하지 않는다면, `null`을 검사하는 코드나 단언문(assertion)을 추가해야 합니다.

```ts
const el = document.getElementById('status');
el.textContent = 'Ready'; // Object is possibly 'null'.ts(2531)

if (el) {
    el.textContent = 'Ready';
}
el!.textContent = 'Ready';
```

### 요약

- 자바스크립트 프로젝트를 타입스크립트로 전환하는 것이 아니라면 `noImplicitAny`, `strictNullChecks`를 설정하는 것이 좋습니다.
- 타입스크립트에서 엄격한 검사를 하고 싶다면 strict 설정을 고려해야 합니다.

### 참고

- [tsconfig.json을 설정해보자](https://egas.tistory.com/120?category=481580)
