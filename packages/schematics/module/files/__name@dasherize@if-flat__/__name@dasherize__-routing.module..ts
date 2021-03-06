import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@ng-ally/router";

const routes: Routes = [];

@NgModule({
  imports: [RouterModule.for<%= routingScope %>(routes)],
  exports: [RouterModule]
})
export class <%= classify(name) %>RoutingModule {}
