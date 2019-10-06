import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ShortenerService } from './services/shortener.service';
import { tap } from 'rxjs/operators';
import { HistoryLink } from './interfaces/bitly.interface';
import { NzCopyToClipboardService, NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {
  title = 'bitly';
  loading = false;
  shortenerForm: FormGroup;
  history: HistoryLink[] = [];

  constructor(
    private fb: FormBuilder,
    private shortenerService: ShortenerService,
    private clipboardService: NzCopyToClipboardService,
    private message: NzMessageService
  ) {}

  ngOnInit() {
    this.shortenerForm = this.initializeForm();
    this.history = this.shortenerService.getHistory();
  }

  shorten(form: FormGroup): void {
    this.loading = true;
    this.shortenerService
      .shorten(form.value.long, form.value.custom)
      .pipe(tap(() => (this.loading = false)))
      .subscribe(
        response => {
          this.history.unshift({ ...response });
          this.shortenerService.addToHistory(this.history);
          this.shortenerForm.controls.long.setValue(null);
          this.shortenerForm.controls.custom.setValue(null);
          this.clipboardService.copy(response.short);
          this.message.success('Copied short link!');
        },
        error => {
          this.message.error(error.error.message);
        }
      );
  }

  copyToClipboard(short: string) {
    this.clipboardService.copy(short);
    this.message.success('Copied short link!');
    const index = this.history.findIndex(link => link.short === short);
    this.history[index].clicked = true;
    this.shortenerService.addToHistory(this.history);
  }

  getStats(id: string) {
    this.shortenerService.getStats(id).subscribe(response => {
      const index = this.history.findIndex(link => link.id === id);
      this.history[index].visits = response.visits;
      this.shortenerService.addToHistory(this.history);
    });
  }

  private initializeForm(): FormGroup {
    const reg = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';
    return this.fb.group({
      long: [
        null,
        [Validators.min(10), Validators.required, Validators.pattern(reg)]
      ],
      custom: [null, [Validators.max(20)]]
    });
  }
}
