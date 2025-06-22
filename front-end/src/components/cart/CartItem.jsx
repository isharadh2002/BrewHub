// front-end/src/components/cart/CartItem.jsx
import {useState} from 'react';
import {Link} from 'react-router-dom';
import {Plus, Minus, Trash2, Edit2} from 'lucide-react';

const CartItem = ({item, onUpdateQuantity, onRemove, onEdit}) => {
    const [isUpdating, setIsUpdating] = useState(false);

    const handleQuantityChange = async (newQuantity) => {
        setIsUpdating(true);
        await onUpdateQuantity(item.id, newQuantity);
        setIsUpdating(false);
    };

    return (
        <div className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex gap-4">
                {/* Item Image */}
                <Link to={`/menu/${item.menuItem._id}`} className="flex-shrink-0">
                    <img
                        src={item.menuItem.image}
                        alt={item.menuItem.name}
                        className="w-24 h-24 object-cover rounded-lg hover:opacity-90 transition-opacity"
                    />
                </Link>

                {/* Item Details */}
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <Link
                                to={`/menu/${item.menuItem._id}`}
                                className="font-semibold text-lg hover:text-brown-600 transition-colors"
                            >
                                {item.menuItem.name}
                            </Link>
                            <p className="text-gray-600 text-sm mt-1">
                                {item.menuItem.category} • ${item.price.toFixed(2)} each
                            </p>

                            {/* Customizations */}
                            {item.customizations.length > 0 && (
                                <div className="mt-2 space-y-1">
                                    {item.customizations.map((custom, idx) => (
                                        <p key={idx} className="text-sm text-gray-500">
                                            <span className="font-medium">{custom.name}:</span> {custom.option.name}
                                            {custom.option.priceModifier > 0 && (
                                                <span className="text-brown-600">
                                                    {' '}(+${custom.option.priceModifier.toFixed(2)})
                                                </span>
                                            )}
                                        </p>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Remove Button */}
                        <button
                            onClick={() => onRemove(item.id)}
                            className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-md transition-colors"
                            title="Remove from cart"
                        >
                            <Trash2 className="w-5 h-5"/>
                        </button>
                    </div>

                    {/* Quantity and Price */}
                    <div className="flex items-center justify-between mt-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => handleQuantityChange(item.quantity - 1)}
                                disabled={isUpdating || item.quantity <= 1}
                                className="p-2 border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Minus className="w-4 h-4"/>
                            </button>

                            <span className={`w-12 text-center font-medium ${isUpdating ? 'opacity-50' : ''}`}>
                                {item.quantity}
                            </span>

                            <button
                                onClick={() => handleQuantityChange(item.quantity + 1)}
                                disabled={isUpdating}
                                className="p-2 border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Plus className="w-4 h-4"/>
                            </button>

                            {/* Edit Customizations Button */}
                            {item.menuItem.customizations && item.menuItem.customizations.length > 0 && onEdit && (
                                <button
                                    onClick={() => onEdit(item)}
                                    className="ml-3 text-sm text-brown-600 hover:text-brown-700 flex items-center gap-1"
                                >
                                    <Edit2 className="w-4 h-4"/>
                                    Edit
                                </button>
                            )}
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                            <p className="font-semibold text-lg">
                                ${(item.price * item.quantity).toFixed(2)}
                            </p>
                            {item.quantity > 1 && (
                                <p className="text-sm text-gray-500">
                                    ${item.price.toFixed(2)} × {item.quantity}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartItem;