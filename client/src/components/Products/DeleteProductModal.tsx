import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle } from "lucide-react";

interface DeleteProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
}

export function DeleteProductModal({ isOpen, onClose, product }: DeleteProductModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteProductMutation = useMutation({
    mutationFn: () => apiRequest(`/api/products/${product.id}`, {
      method: "DELETE",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products/watchlist"] });
      toast({ title: "Product deleted successfully" });
      onClose();
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to delete product", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const handleDelete = () => {
    deleteProductMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[hsl(240,10%,13%)] border-[hsl(240,3.7%,15.9%)] text-white max-w-md" aria-describedby="delete-product-description">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <DialogTitle className="text-xl">Delete Product</DialogTitle>
          </div>
          <DialogDescription id="delete-product-description" className="text-gray-400">
            Are you sure you want to delete "{product?.name}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-slate-800/50 rounded-lg p-4 my-4">
          <h4 className="font-medium text-white mb-2">Product Details:</h4>
          <div className="space-y-1 text-sm text-gray-400">
            <p><span className="font-medium">Name:</span> {product?.name}</p>
            <p><span className="font-medium">Category:</span> {product?.category}</p>
            <p><span className="font-medium">Status:</span> {product?.status || 'researching'}</p>
            {product?.estimatedPrice && (
              <p><span className="font-medium">Est. Price:</span> ${product.estimatedPrice}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={deleteProductMutation.isPending}
            className="border-slate-600 text-white hover:bg-slate-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={deleteProductMutation.isPending}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {deleteProductMutation.isPending ? "Deleting..." : "Delete Product"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteProductModal;