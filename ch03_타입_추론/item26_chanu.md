# 타입 추론에서 문맥이 어떻게 사용되고 있는가 이해하기

> TS의 변수는 정적 체크 시점에 단일 값이 아닌, 가질 수 있는 값의 집합인 '타입'을 가진다.

```typescript
let num = 10;
```

'타입 넓히기' 아이템에서 설명하였듯 `num`변수는 값인 10이 아닌 number 타입을 가진다. 즉, 선언된 값을 통해 추론하되, 단순히 그 값만을 고려하지 않고 문맥을 함께 고려한다는 것이다.

```typescript
type Language = 'JavaScript' | 'TypeScript' | 'Python';

function setLanguage(language: Language) {
    console.log(language);
}

setLanguage('JavaScript') // inline

let language = 'JavaScript';
setLanguage(language); // variable
```
- `setLanguage`는 값의 union 타입인 `Language` 타입의 인자를 받는다.
- 인라인으로 호출한 `setLanguage`와 변수를 사용하여 호출한 `setLanguage`는 값만 따져보았을 때 동일한 값으로 인자로 호출하였다.
- 하지만 아래 변수로 호출한 코드는 에러가 발생하는데 변수 `language`는 값이 아닌 집합으로 'string' 타입을 가지기 때문이다.

> 값을 변수로 분리해내게 되면, 변수의 할당시점에 '타입'을 추론하기 때문이다.

- 인라인으로 호출하는 경우, 할당을 수행하지 않기 때문에 문맥이 존재하지 않으므로 단순히 '값'으로 본다.
- 하지만 변수를 선언하는 경우, 값 뿐 만이 아니라 선언하는 문맥까지 고려하게 되고, 할당 시점에 추론된 타입인 'number'을 가지게 된다.

#### 변수로 재선언하였으므로, 우리는 '문맥'으로부터 '값'을 분리하는 작업을 한 것이다.

<br/>

### '문맥'으로부터 '값'을 분리하는 작업으로 인해 발생한 불일치를 해결하는 방법으로 '타입 넓히기'에서 두가지 방법을 제시하고 있다.

#### 1. 변수 선언시, 타입 구문 추가히기

```typescript
let language: Language = 'JavaScript';
setLanguage(language); // variable
```

- 값 뿐 만 아니라, 인자의 `Language` 타입과 동일하게 맞춰줌으로써 에러를 방지할 수 있다.

#### 2. `const` 사용하기 

```typescript
const language = 'JavaScript';
setLanguage(language); // variable
```
- 할당 시점에 ‘집합’이 아닌 ‘값’을 타입으로 가지도록 한다. 이는 문맥상 값의 변경이 존재하지 않다는 것이 명확하기 때문이다.

<br/>

### '문맥'으로부터 '값'을 분리하는 작업을 수행하는 경우, 오류가 발생할 수 있다.

> 이러한 문제가 발생하는 이유는 기본적으로 `const`는 '얕게' 동작하기 때문이다.

객체나 배열에 `const`를 선언하게 된다고 내부의 원소나 속성이 불변하지 않는다. 참조가 변하지 않는다는 보장이기 때문에 내부의 원소나 속성은 충분히 변경가능하며, 그러므로 'let'과 동일하게 타입을 추론한다.

#### 1. 튜플 사용시

```typescript
function panTo(where: [number, number]){
    console.log(where);
}
panTo([10, 20]); // inline

const loc = [10, 20]; // 문맥에서 값을 분리함
panTo(loc); 
```

`loc`는 문맥에서 값을 분리하였고, 할당시점에 `number[]`로 추론된다. 단일 값에 대해서는 `const`로 선언하였을 경우, 값의 불변을 보장하기 때문에 `[number, number]`가 아닌가 생각할 수 있으나 배열에 대해서는 다르게 동작하기 때문에 `number[]`으로 추론된다. 

1. **타입구문 추가하기**
   ```typescript
        const loc: [number, number] = [10, 20];
    ```
    <br/>

2. **타입 단언문 `as const` 사용하기**

   `const`가 배열과 객체에는 의도대로 동작하지 않기 때문에 `as const`를 사용하는 것으로 배웠다.
    ```typescript
        const loc = [10, 20] as const;
   ```
    이렇게 하면 될줄 알았으나, 실제로 `loc`는 `readonly [10, 20]`의 타입을 가진다. 즉, 두개의 원소를 가진 배열임은 확실하나 값 또한 변하지 못한다는 것까지 포함하여 추론되었다. 이는 두개의 원소를 가지지만 값의 불변성까지는 보장하지 않는 `[number, number]` 타입과 다르게 된다. 그래서 이런 경우, `panTo` 함수에 `readonly`를 추가하는 것으로 해결책을 가이드하고 있다.

    ```typescript
        function panTo(where: readonly [number, number]){
            console.log(where)    
        }
        const loc = [10, 20] as const; // 문맥에서 값을 분리함
        panTo(loc);
    ```  
   
    하지만 이러한 회피기는 또 다른 문제를 발생하게 하는데, 타입 단언문인 `as const`를 생길 때 발생할 수 있는 문제이다.
    ```typescript
        const loc = [10, 20, 30] as const;
        panTo(loc);
    ```
   `loc`이라는 변수는 `where`가 가지는 타입을 위해서 선언한 ‘의도’를 가지고 있다. 하지만 이러한 문제를 선언시점에 파악해야하지만 실행시점에 파악해야한다는 문제가 발생할 수 있기 때문이다.


<br/>

아래의 두가지 예시가 더 나오는데, 동일한 문제와 해결책을 제시하고 있다. 

#### 2. 객체 사용시
```typescript
type Language = 'JavaScript' | 'TypeScript' | 'Python';
interface GovernedLanguage {
    language: Language;
    organization: string;
}

function complain(language: GovernedLanguage) {
    console.log(language.language);
}

complain({language : 'JavaScript', organization: 'Microsoft'});

const ts = {
    language : 'JavaScript',
    organization: 'Microsoft'
}
complain(ts);
```

객체 `ts`는 할당시점에 타입을 가지므로 `{ language: string, organization: string }`으로 타입이 추론된다. 이는 `GovernedLanguage`와 차이가 존재한다. 이와같이 문맥에서 값을 분리하는 경우, 에러가 발생한다. 해결방법은 튜플 사용시와 동일하게 동일하다. 

1. **타입구문 추가하기**
   ```typescript
     const ts: GovernedLanguage = {
        language : 'JavaScript',
        organization: 'Microsoft'
     }
    ```
    <br/>

2. **타입 단언문 `as const` 사용하기**
   ```typescript
     const ts: GovernedLanguage = {
        language : 'JavaScript' as const,
        organization: 'Microsoft'
     }
    ```
   - 속성에 대한 타입 단언문을 추가하여 값의 집합이 아닌 값을 타입으로 가지도록 타입 넓히기를 제한하였다.
   
   <br/>
#### 3. 콜백 사용시

```typescript
function callWithRandomNumbers(fn: (n1: number, n2: number) => void) {
    fn(Math.random(), Math.random());
}

callWithRandomNumbers((a, b) => {
    console.log(a + b); // a, b type은 number로 추론된다.
})

const func = (a, b) => {
    console.log(a + b); // a, b type은 any로 추론된다. 
}

callWithRandomNumbers(func);
```

위의 경우와 같이 `func` 함수를 변수로 선언하게 되면, 인자에 대한 타입 추론이 할당 시점에 발생하므로 모두 `any`가 된다. 이를 위해 타입 구문을 추가하여 해결한다.

1. **타입구문 추가하기**
   ```typescript
   const func = (a: number, b: number) => {
        console.log(a + b);
   }
   
   type callback = (a: number, b: number) => void;
   const func2: callback = (a, b) => {
        console.log(a + b);
   }
    ```
   
   - 콜백 함수에 대한 타입을 정의해두는 것도 하나의 방법이다. 실제로 라이브러리의 경우, 콜백 함수의 타입을 미리 구현해둔다.


<br/>

### 정리하자면,

#### '문맥'으로부터 '값'을 분리하는 경우, 타입을 올바르게 지정하기 위해 사용하는 방법을 기억하자.





