import { CommonModule } from './modules/common/common.module'
import { UserModule } from './modules/user/user.module'
import { AuthModule } from './modules/auth/auth.module'
import { GroupModule } from "@/modules/group/group.module";

@Module({
  imports: [
    CommonModule.register(),
    AuthModule,
    UserModule,
    GroupModule
  ]
})
export class AppModule {}
