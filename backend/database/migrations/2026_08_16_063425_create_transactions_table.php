    <?php

    use Illuminate\Database\Migrations\Migration;
    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;

    return new class extends Migration
    {
        public function up(): void
        {
            Schema::create('transactions', function (Blueprint $table) {
                $table->id();

                $table->string('invoice_number')->unique();

                $table->foreignId('user_id')
                    ->constrained()
                    ->onDelete('cascade');

                $table->dateTime('transaction_date');

                $table->string('payment_method');

                $table->enum('status', [
                    'Completed',
                    'Pending',
                    'Cancelled'
                ])->default('Completed');

                $table->decimal('subtotal', 15, 2)->default(0);

                $table->decimal('tax', 15, 2)->default(0);

                $table->decimal('grand_total', 15, 2)->default(0);

                $table->timestamps();
            });
        }
    };
