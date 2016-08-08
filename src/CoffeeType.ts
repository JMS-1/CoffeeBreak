module CoffeeBreak {

    export class CoffeeType implements JMS.SharePoint.ISerializable {
        listName = Constants.listNames.coffeeTypes;

        contentTypeId = Constants.contentTypeIds.coffeeTypes;

        company: string;

        name: string;

        coffein: boolean = true;

        saveTo(item: SP.ListItem): void {
            var company = (this.company || '').trim();
            var name = (this.name || '').trim();

            if ((company.length > 0) || (name.length > 0))
                item.set_item('FullName', `${company}: ${name}`);

            item.set_item('WithCoffein', this.coffein === true);
        }
    }

}