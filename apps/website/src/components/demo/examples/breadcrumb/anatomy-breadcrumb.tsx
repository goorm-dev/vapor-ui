import { Breadcrumb } from '@vapor-ui/core';

export default function AnatomyBreadcrumb() {
    return (
        <Breadcrumb.RootPrimitive data-part="RootPrimitive">
            <Breadcrumb.ListPrimitive data-part="ListPrimitive">
                <Breadcrumb.ItemPrimitive data-part="ItemPrimitive">
                    <Breadcrumb.LinkPrimitive data-part="LinkPrimitive" href="#">
                        Home
                    </Breadcrumb.LinkPrimitive>
                </Breadcrumb.ItemPrimitive>
                <Breadcrumb.Separator data-part="Separator" />
                <Breadcrumb.ItemPrimitive>
                    <Breadcrumb.LinkPrimitive href="#">Products</Breadcrumb.LinkPrimitive>
                </Breadcrumb.ItemPrimitive>
                <Breadcrumb.Separator />
                <Breadcrumb.Ellipsis data-part="Ellipsis" />
                <Breadcrumb.Separator />
                <Breadcrumb.ItemPrimitive>
                    <Breadcrumb.LinkPrimitive href="#" current>
                        Details
                    </Breadcrumb.LinkPrimitive>
                </Breadcrumb.ItemPrimitive>
            </Breadcrumb.ListPrimitive>
        </Breadcrumb.RootPrimitive>
    );
}
