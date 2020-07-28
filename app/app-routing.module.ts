import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminloginComponent } from './pages/adminlogin/adminlogin.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { TotalmembersComponent } from './pages/totalmembers/totalmembers.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { AuthguardGuard } from './guards/authguard.guard';
import { AddproductComponent } from './pages/addproduct/addproduct.component';
import { UpdateproductComponent } from './pages/updateproduct/updateproduct.component'


const routes: Routes = [
  {path:'',component:AdminloginComponent},
  {path:'dashboard',component:DashboardComponent,canActivate:[AuthguardGuard],children:[
    {path:'totalmembers',component:TotalmembersComponent},
    {path:'orders',component:OrdersComponent},
    {path:'addproduct',component:AddproductComponent},
    {path:'updated',component:UpdateproductComponent}
  ]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
