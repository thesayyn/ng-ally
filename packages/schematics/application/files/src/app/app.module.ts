import { NgModule } from '@angular/core'
import { ServerModule } from '@ng-ally/platform-server'

@NgModule({
    imports: [
        ServerModule
    ]
})
export class AppModule{
    ngDoBootstrap(){}
}