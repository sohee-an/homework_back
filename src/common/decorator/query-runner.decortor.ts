import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common';

export const QueryRunner = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();

  if (!request.QueryRunner) {
    throw new InternalServerErrorException(
      'QueryRunner decorator를 사용하려면 TransactionInterceptor를 적용해야 합니다.',
    );
  }
  return request.QueryRunner;
});
