# 타입 커버리지를 추적하여 타입 안전성 유지하기

`noImplicitAny`를 설정하고 모든 암시적 any대신 명시적 타입 구문을 추가해도 any 타입과 관련된 문제들로부터 안전하다고 할 수 없습니다.

any 타입이 여전히 프로그램 내에 존재할 수 있는 두 가지 경우가 있습니다.

1. 명시적 any 타입

- any 타입의 범위를 좁히고 구체적으로 만들어도 여전히 any 타입입니다. 
  
  특히 any[]와 {[key: string]: any}같은 타입은 인덱스를 생성하면 단순 any 타입이 되고 코드 전반에 영향을 미칩니다.

2. 서드파티 타입 선언

- 이 경우는 @types 선언 파일로부터 any 타입이 전파되기 때문에 특별히 조심해야 합니다. 

  `noImplicitAny`를 설정하고 절대 any를 사용하지 않았다 하더라도 여전히 any 타입은 코드 전반에 영향을 미칩니다.

any 타입은 타입 안전성과 생산성에 부정적인 영향을 미칠 수 있으므로 프로젝트에서 any의 개수를 추적하는 것이 좋습니다.

npm의 type-coverage 패키지를 활용해서 any를 추적할 수 있습니다.

(참고: https://www.npmjs.com/package/type-coverage)

## any 가 등장하는 몇 가지 문제와 그 해결책

1. 함수의 반환으로 any가 남아 있는 경우

   표 형태의 데이터에서 어떤 종류의 열(column) 정보를 반환하는 함수를 만든다고 가정해봅시다.

   ```typescript
   function getColumnInfo(name: string): any {
     return utils.buildColumnInfo(appState.dataSchema, name); // any를 반환합니다.
   }
   ```

   `utils.buildColumnInfo` 호출은 any를 반환합니다. 따라서 `getColumnInfo` 함수의 반환에는 주석과 함께 명시적으로 :any 구문을 추가했습니다.

   이후에 타입 정보를 추가하기 위해 `ColumnInfo` 타입을 정의하고 `utils.buildColumnInfo`가 `any` 대신 `ColumnInfo`를 반환하도록 개선해도 `getColumnInfo` 함수의 반환문에 있는 `any` 타입이 모든 타입 정보를 날려 버리게 됩니다. 
   
   > `getColumnInfo`에 남아 있는 `any`까지 제거해야 문제가 해결됩니다.

2. 서드파티 라이브러리로부터 비롯되는 any

   #### 2-1. 전체 모듈에 any 타입을 부여하는 경우(극단적)

   ```typescript
   declare module 'my-module';
   ```

   앞의 선언으로 인해 my-module에서 어떤 것이든 오류 없이 임포트할 수 있습니다. 임포트안 모든 심벌은 any 타입이고, 임포트한 값이 사용되는 곳마다 any 타입을 양산하게 됩니다.

   ```typescript
   import { someMethod, someSymbol } from 'my-module';
   const pt1 = {
     x: 1,
     y: 2,
   };
   const pt2 = someMethod(pt1, someSymbol); // type이 any
   ```

   일반적인 모듈의 사용법과 동일하기 때문에, 타입 정보가 모두 제거됐다는 것을 간과할 수 있습니다.
   
   > 가끔 모듈들을 점검해야 합니다.

  <img width="583" alt="image" src="https://user-images.githubusercontent.com/76726411/203309119-d9f44c11-7d24-49c4-bc88-a59eb9e91e45.png">


   #### 2-2. 타입에 버그가 있는 경우
   예를 들어 아이템 29의 조언(값을 생성할 때는 엄격하게 타입을 적용하라)를 무시한 채로, 함수가 유니온 타입을 반환하도록 선언하고 실제로는 유니온 타입보다 훨씬 더 특정된 값을 반환하는 경우입니다.

   선언된 타입과 실제 반환된 타입이 맞지 않는다면 어쩔 수 없이 any 단언문을 사용해야 합니다. 
   >그러나 나중에 라이브러리가 업데이트되어 함수의 선언문이 제대로 수정된다면 any를 제거해야 합니다. 

   
3. 기타 경우
- any 타입이 사용되는 코드가 실제로는 더 이상 실행되지 않는 코드일 수 있습니다.
- 어쩔 수 없이 any를 사용했던 부분이 개선되어 제대로 된 타입으로 바뀌었다면 any가 더 이상 필요 없을 수 있습니다.
- 버그가 있는 타입 선언문이 업데이트되어 제대로 타입 정보를 가질 수도 있습니다.
> 타입 커버리지를 추적하면 이러한 부분들을 쉽게 발견할 수 있기 때문에 코드를 꾸준히 점검할 수 있게 해줍니다.

## 요약
- `noImplicitAny`가 설정되어 있어도, 명시적 any 또는 서드파티 타입 선언(@types)을 통해 any 타입은 코드 내에 여전히 존재할 수 있음을 주의해야 합니다.
- 작성한 프로그램의 타입이 얼마나 잘 선언되었는지 추적해야 합니다. 추적함으로써 any의 사용을 줄여 나갈 수 있고 타입 안전성을 꾸준히 높일 수 있습니다.