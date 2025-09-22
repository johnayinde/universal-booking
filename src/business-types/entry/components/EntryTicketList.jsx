// src/business-types/entry/components/EntryTicketList.jsx - EXACT UI MATCH
import React, { useState, useEffect } from "react";
import { useUniversalBooking } from "../../../core/UniversalStateManager";
import { ActionTypes } from "../../../core/UniversalStateManager";
import { Minus, Plus, Ticket, User, CheckCircle } from "lucide-react";

const EntryTicketList = () => {
  const {
    state,
    dispatch,
    adapter,
    apiService,
    setCurrentStep,
    setError,
    setLoading,
  } = useUniversalBooking();

  // Sample ticket data - matches your UI design exactly
  const sampleTickets = [
    {
      id: 1,
      name: "Regular Ticket",
      price: 3000,
      max_per_order: 10,
      available: true,
    },
    {
      id: 2,
      name: "VIP Ticket",
      price: 4000,
      max_per_order: 5,
      available: true,
    },
  ];

  const [tickets, setTickets] = useState(sampleTickets);
  const [selections, setSelections] = useState({});
  const [totalAmount, setTotalAmount] = useState(0);

  // Initialize selections on component mount
  useEffect(() => {
    const initialSelections = {};
    tickets.forEach((ticket) => {
      initialSelections[ticket.id] = 0;
    });
    setSelections(initialSelections);
  }, [tickets]);

  // Update total when selections change
  useEffect(() => {
    const total = calculateTotal(selections, tickets);
    setTotalAmount(total);

    // Update state
    dispatch({
      type: ActionTypes.UPDATE_SELECTIONS,
      payload: selections,
    });

    dispatch({
      type: ActionTypes.SET_TOTAL_AMOUNT,
      payload: total,
    });
  }, [selections, tickets, dispatch]);

  const calculateTotal = (selections, tickets) => {
    let total = 0;
    Object.keys(selections).forEach((ticketId) => {
      const quantity = selections[ticketId];
      const ticket = tickets.find((t) => t.id.toString() === ticketId);
      if (ticket && quantity > 0) {
        total += parseFloat(ticket.price || 0) * quantity;
      }
    });
    return total;
  };

  const updateQuantity = (ticketId, newQuantity) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    const maxQuantity = ticket?.max_per_order || 10;

    // Ensure quantity is within bounds
    const quantity = Math.max(0, Math.min(newQuantity, maxQuantity));

    setSelections((prev) => ({
      ...prev,
      [ticketId]: quantity,
    }));
  };

  const canProceed = () => {
    return Object.values(selections).some((qty) => qty > 0);
  };

  const handleNext = () => {
    if (canProceed()) {
      // Store selected tickets for reference
      const selectedTickets = getSelectedTickets(selections, tickets);
      dispatch({
        type: ActionTypes.SET_SELECTED_ITEM,
        payload: { selectedTickets, selections },
      });

      setCurrentStep("booking");
    }
  };

  const getSelectedTickets = (selections, availableTickets) => {
    return Object.keys(selections)
      .filter((ticketId) => selections[ticketId] > 0)
      .map((ticketId) => {
        const ticket = availableTickets.find(
          (t) => t.id.toString() === ticketId
        );
        return {
          ...ticket,
          quantity: selections[ticketId],
          totalPrice: parseFloat(ticket.price || 0) * selections[ticketId],
        };
      });
  };

  const formatCurrency = (amount) => {
    return `₦${parseFloat(amount).toLocaleString()}`;
  };

  const getStepIcon = (stepKey, isActive, isCompleted) => {
    const icons = {
      list: Ticket,
      booking: User,
      confirmation: CheckCircle,
    };

    const Icon = icons[stepKey];
    return Icon ? (
      <Icon size={20} />
    ) : (
      <div className="w-5 h-5 bg-current rounded-full" />
    );
  };

  const bookingSteps = [
    { key: "list", label: "Booking Type", component: "list" },
    { key: "list", label: "Tickets", component: "list" },
    { key: "booking", label: "Personal Details", component: "booking" },
  ];
  const currentStepIndex = bookingSteps.findIndex(
    (step) => step.key === state.currentStep
  );

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 p-6">
        <div className="mb-8">
          <img
            src="/api/placeholder/80/60"
            alt="Nike Lake Resort"
            className="w-20 h-16 rounded-lg object-cover mb-4"
            onError={(e) => {
              e.target.src =
                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA4MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjIwIiB5PSIxNSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=";
            }}
          />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Nike Lake
            <br />
            Resort,
            <br />
            Enugu
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            Welcome to Nike Lake Resort
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Enjoy the perfect blend of business and leisure with breath-taking
            views in a very secure and tranquil setting.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="space-y-2">
          <div className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-green-50 text-green-700">
            <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">
              ✓
            </div>
            <span className="font-medium">Booking Type</span>
          </div>

          <div className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-orange-100 text-orange-700 border-l-4 border-orange-500">
            <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">
              2
            </div>
            <span className="font-medium text-orange-800">Tickets</span>
          </div>

          <div className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400">
            <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center text-sm">
              3
            </div>
            <span className="font-medium">Personal Details</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Center Content */}
        <div className="flex-1 p-8">
          <div className="max-w-2xl">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-2 text-orange-600 mb-2">
                <Ticket size={20} />
                <span className="text-sm font-medium">Ticket Type</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Select an entry ticket type and quantity
              </h1>
            </div>

            {/* Tickets */}
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-white border border-gray-200 rounded-xl p-6"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {ticket.name}
                      </h3>
                      <div className="text-2xl font-bold text-gray-900 mb-4">
                        {formatCurrency(ticket.price)}
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() =>
                          updateQuantity(
                            ticket.id,
                            (selections[ticket.id] || 0) - 1
                          )
                        }
                        disabled={(selections[ticket.id] || 0) <= 0}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                          (selections[ticket.id] || 0) <= 0
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        <Minus size={16} />
                      </button>

                      <span className="w-8 text-center font-bold text-xl">
                        {selections[ticket.id] || 0}
                      </span>

                      <button
                        onClick={() =>
                          updateQuantity(
                            ticket.id,
                            (selections[ticket.id] || 0) + 1
                          )
                        }
                        disabled={
                          (selections[ticket.id] || 0) >= ticket.max_per_order
                        }
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                          (selections[ticket.id] || 0) >= ticket.max_per_order
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-orange-600 text-white hover:bg-orange-700"
                        }`}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Custom Group Section */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Custom Group</h4>
              <p className="text-blue-800 text-sm mb-3">
                If you want to book with a large group, please contact us for
                custom pricing.
              </p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                Contact us
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Ticket Details
          </h3>

          <div className="space-y-4 mb-8">
            {Object.keys(selections)
              .filter((ticketId) => selections[ticketId] > 0)
              .map((ticketId) => {
                const ticket = tickets.find(
                  (t) => t.id.toString() === ticketId
                );
                const quantity = selections[ticketId];
                const totalPrice = parseFloat(ticket?.price || 0) * quantity;

                return (
                  <div key={ticketId} className="space-y-1">
                    <div className="flex justify-between items-start">
                      <div className="text-sm font-medium text-gray-900">
                        {ticket?.name}
                      </div>
                      <div className="text-sm font-bold text-gray-900">
                        {formatCurrency(ticket?.price)}
                      </div>
                    </div>
                    <div className="flex justify-between items-start">
                      <div className="text-sm text-gray-500">
                        {ticket?.name?.includes("VIP") ? "XMAS30 VIFID" : ""}
                      </div>
                      <div className="text-sm text-red-600">
                        {ticket?.name?.includes("VIP") ? "₦1,000" : ""}
                      </div>
                    </div>
                  </div>
                );
              })}

            {Object.values(selections).every((qty) => qty === 0) && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-sm">No Data</div>
                <div className="text-xs mt-1">
                  No item has been added to cart
                </div>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="border-t border-gray-200 pt-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <span className="text-xl font-bold text-gray-900">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <button
            onClick={() => setCurrentStep("list")}
            className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              canProceed()
                ? "bg-orange-500 text-white hover:bg-orange-600"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

// export default EntryTicketList; <Icon size={20} /> : <div className="w-5 h-5 bg-current rounded-full" />;
//   };

//   if (state.isLoading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading tickets...</p>
//         </div>
//       </div>
//     );
//   }

//   if (state.error) {
//     return (
//       <div className="text-center py-12">
//         <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
//           <div className="text-red-600 mb-4">
//             <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
//               <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//             </svg>
//           </div>
//           <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Tickets</h3>
//           <p className="text-red-700 mb-4">{state.error}</p>
//           <button
//             onClick={loadTickets}
//             className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const bookingSteps = adapter.getBookingSteps();
//   const currentStepIndex = bookingSteps.findIndex(step => step.key === state.currentStep);

//   return (
//     <div className="h-full flex bg-gray-50">
//       {/* Left Sidebar */}
//       <div className="w-72 bg-white border-r border-gray-200 p-6">
//         <div className="mb-8">
//           <img
//             src="/api/placeholder/80/60"
//             alt="Nike Lake Resort"
//             className="w-20 h-15 rounded-lg object-cover mb-4"
//           />
//           <h2 className="text-xl font-semibold text-gray-900 mb-2">
//             Nike Lake Resort, Enugu
//           </h2>
//           <p className="text-gray-600 text-sm">
//             Enjoy the perfect blend of business and leisure with peaceful waterfront setting.
//           </p>
//         </div>

//         {/* Booking Steps */}
//         <div className="space-y-1">
//           {bookingSteps.map((step, index) => {
//             const isActive = state.currentStep === step.key;
//             const isCompleted = index < currentStepIndex;
//             const isEnabled = index <= currentStepIndex || isCompleted;

//             return (
//               <div
//                 key={step.key}
//                 className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
//                   isActive
//                     ? "bg-orange-100 text-orange-700 border-l-4 border-orange-500"
//                     : isCompleted
//                     ? "bg-green-50 text-green-700"
//                     : isEnabled
//                     ? "text-gray-600 hover:bg-gray-50"
//                     : "text-gray-400"
//                 }`}
//               >
//                 <div className={`flex-shrink-0 ${isActive ? "text-orange-600" : isCompleted ? "text-green-600" : "text-gray-400"}`}>
//                   {getStepIcon(step.key, isActive, isCompleted)}
//                 </div>
//                 <span className={`font-medium ${isActive ? "text-orange-800" : ""}`}>
//                   {step.label}
//                 </span>
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 flex">
//         <div className="flex-1 p-8">
//           <div className="max-w-2xl">
//             <div className="mb-8">
//               <div className="flex items-center space-x-2 text-orange-600 mb-2">
//                 <Ticket size={20} />
//                 <span className="text-sm font-medium">Ticket Type</span>
//               </div>
//               <h1 className="text-2xl font-bold text-gray-900 mb-2">
//                 Select an entry ticket and quantity
//               </h1>
//             </div>

//             {/* Ticket Selection */}
//             <div className="space-y-4">
//               {tickets.map((ticket) => (
//                 <TicketCard
//                   key={ticket.id}
//                   ticket={ticket}
//                   quantity={selections[ticket.id] || 0}
//                   onQuantityChange={(qty) => updateQuantity(ticket.id, qty)}
//                   adapter={adapter}
//                   config={state.config}
//                 />
//               ))}
//             </div>

//             {/* Custom Ticket Note */}
//             <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
//               <h4 className="font-medium text-blue-900 mb-2">Custom Group</h4>
//               <p className="text-blue-800 text-sm mb-3">
//                 If you want to book with a large group, please contact us for custom pricing.
//               </p>
//               <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
//                 Contact us
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Right Sidebar - Ticket Summary */}
//         <div className="w-80 bg-white border-l border-gray-200 p-6">
//           <h3 className="text-lg font-semibold text-gray-900 mb-6">Ticket Details</h3>

//           <div className="space-y-4 mb-8">
//             {Object.keys(selections)
//               .filter(ticketId => selections[ticketId] > 0)
//               .map(ticketId => {
//                 const ticket = tickets.find(t => t.id.toString() === ticketId);
//                 const quantity = selections[ticketId];
//                 const totalPrice = parseFloat(ticket?.price || 0) * quantity;

//                 return (
//                   <div key={ticketId} className="flex justify-between items-start">
//                     <div className="flex-1">
//                       <div className="text-sm font-medium text-gray-900">
//                         {ticket?.name} x{quantity}
//                       </div>
//                       <div className="text-sm text-gray-500">
//                         {adapter.formatCurrency(ticket?.price, state.config)} each
//                       </div>
//                     </div>
//                     <div className="text-sm font-medium text-gray-900">
//                       {adapter.formatCurrency(totalPrice, state.config)}
//                     </div>
//                   </div>
//                 );
//               })
//             }

//             {Object.values(selections).every(qty => qty === 0) && (
//               <div className="text-center py-8 text-gray-500">
//                 <Ticket size={48} className="mx-auto mb-4 text-gray-300" />
//                 <p>No tickets selected yet</p>
//               </div>
//             )}
//           </div>

//           {/* Total */}
//           <div className="border-t border-gray-200 pt-4 mb-6">
//             <div className="flex justify-between items-center">
//               <span className="text-lg font-semibold text-gray-900">Total</span>
//               <span className="text-xl font-bold text-gray-900">
//                 {adapter.formatCurrency(totalAmount, state.config)}
//               </span>
//             </div>
//           </div>

//           {/* Navigation Buttons */}
//           <div className="space-y-3">
//             <button
//               onClick={handleNext}
//               disabled={!canProceed()}
//               className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
//                 canProceed()
//                   ? "bg-orange-600 text-white hover:bg-orange-700"
//                   : "bg-gray-200 text-gray-500 cursor-not-allowed"
//               }`}
//             >
//               Next
//             </button>

//             <button
//               onClick={() => window.parent?.postMessage?.({ type: 'close-widget' }, '*')}
//               className="w-full py-3 px-4 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
//             >
//               Back
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// Ticket Card Component
// const TicketCard = ({
//   ticket,
//   quantity,
//   onQuantityChange,
//   adapter,
//   config,
// }) => {
//   const maxQuantity = ticket.max_per_order || 10;
//   const isAvailable = ticket.available !== false;
//   const price = parseFloat(ticket.price || 0);

//   return (
//     <div
//       className={`bg-white border rounded-xl p-6 transition-all ${
//         quantity > 0
//           ? "border-orange-300 ring-2 ring-orange-100"
//           : "border-gray-200 hover:border-gray-300"
//       }`}
//     >
//       <div className="flex justify-between items-start">
//         <div className="flex-1">
//           <h4 className="text-lg font-semibold text-gray-900 mb-2">
//             {ticket.name}
//           </h4>
//           {ticket.description && (
//             <p className="text-gray-600 text-sm mb-4">{ticket.description}</p>
//           )}

//           <div className="flex items-center justify-between">
//             <div className="text-xl font-bold text-gray-900">
//               {price === 0 ? "Free" : adapter.formatCurrency(price, config)}
//             </div>

//             {isAvailable && (
//               <div className="flex items-center space-x-3">
//                 <button
//                   onClick={() => onQuantityChange(quantity - 1)}
//                   disabled={quantity <= 0}
//                   className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
//                     quantity <= 0
//                       ? "bg-gray-100 text-gray-400 cursor-not-allowed"
//                       : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//                   }`}
//                 >
//                   <Minus size={16} />
//                 </button>

//                 <span className="w-8 text-center font-medium text-lg">
//                   {quantity}
//                 </span>

//                 <button
//                   onClick={() => onQuantityChange(quantity + 1)}
//                   disabled={quantity >= maxQuantity}
//                   className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
//                     quantity >= maxQuantity
//                       ? "bg-gray-100 text-gray-400 cursor-not-allowed"
//                       : "bg-orange-600 text-white hover:bg-orange-700"
//                   }`}
//                 >
//                   <Plus size={16} />
//                 </button>
//               </div>
//             )}

//             {!isAvailable && (
//               <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
//                 Sold Out
//               </div>
//             )}
//           </div>

//           {maxQuantity < 10 && (
//             <p className="text-xs text-gray-500 mt-2">
//               Maximum {maxQuantity} per order
//             </p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

export default EntryTicketList;
