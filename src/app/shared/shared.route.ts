import { AddAddressComponent } from "./address/add-address.component";


export const sharedChildren = [
    {path:'address',
        children:[
            {
                path:'app-add-address',
                component:AddAddressComponent
            },
        ]
}

]