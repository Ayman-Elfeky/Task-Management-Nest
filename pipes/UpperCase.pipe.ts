import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class UpperCasePipe implements PipeTransform {
  transform(value: any) {
    console.log("Uppercase pipe: ", value);
    if (typeof value === 'object' && typeof value !== null) {
      for (const key in value) {
        if (typeof value[key] === 'string') {
          value[key] = value[key].toUpperCase();
        }
      }
      return value;
    }

    if (typeof value === 'string') {
      return value.toUpperCase();
    }

    throw new BadRequestException('Validation failed: value must be string or object');
  }
}
