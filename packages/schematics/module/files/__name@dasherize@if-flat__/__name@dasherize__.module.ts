import { NgModule } from "@angular/core";

@NgModule({
  imports: [
    <% if (routing) { %><%= classify(name) %>RoutingModule<% } %>
  ]
})
export class <%= classify(name) %>Module {}
